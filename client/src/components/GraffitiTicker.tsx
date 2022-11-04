import { useEffect, useState } from 'react';
import { Contract, ethers } from 'ethers';
import Marquee from "react-fast-marquee";
import CurrentConfig from '../config';
import CollectorAbi from "../ABIs/Collector.json";
import { profanity } from '@2toad/profanity';


interface Message {
    address: string,
    message: string,
    timestamp: number,
    tx: string,
}

const GraffitiTicker = () => {
    let [messages, setMessages] = useState<Message[]>([]);

    // Query for deposit logs
    useEffect(() => {
        CurrentConfig.Chains.map(chainConfig => {
            let rpcUrl = chainConfig.Chain.rpcUrls.default;
            let network = chainConfig.Chain.id;
            let address = chainConfig.ContractAddr;
            let provider = new ethers.providers.JsonRpcProvider(rpcUrl, network);
            let contract = new Contract(address, CollectorAbi.abi, provider);
            let filter = contract.filters.Claim();
            provider.getBlockNumber()
                .then(blockNumber => {
                    let fromBlock = blockNumber - CurrentConfig.GraffitiMaxBlocks;
                    fromBlock = fromBlock > 0 ? fromBlock : 0;
                    contract.queryFilter(filter, fromBlock)
                        .then(async events => {
                            let newMessages = await Promise.all(events.map(async (evt) => {
                                let block = await evt.getBlock();
                                let msg: Message = {
                                    address: evt!.args!['sender'],
                                    message: profanity.censor(evt!.args!['graffiti']),
                                    timestamp: block.timestamp,
                                    tx: evt.transactionHash
                                }
                                return msg;
                            }));
                            newMessages = newMessages.filter((msg) => msg.message !== "");

                            // Aggregate, sort, dedupe
                            messages = messages.concat(newMessages);
                            messages = messages.sort((a, b) => b.timestamp - a.timestamp);
                            let filteredMessages = messages.filter((msg, index) => messages.findIndex(msg2 => msg2.tx === msg.tx) === index);

                            setMessages(filteredMessages);
                        })
                        .catch(err => console.error(err))
                })
                .catch(err => console.error(err))
        })
    }, [])

    return (
        <div className="fixed bottom-0 graffiti w-full items-end">
            <Marquee gradient={false} gradientWidth={0} speed={50} delay={2}>
                <div className="spacer"></div>
                { messages.length > 0 ? <h1 className="m-2 p-1">Graffiti</h1> : "" }
                { messages.map((msg, index) => {
                    return (
                        <div className="graffiti-blob m-2 p-1 border rounded-md drop-shadow mx-4" key={index}>
                            <span className="text-xs bg-blue-300 rounded-md border border-gray-300 p-0.5">{ shortenAddress(msg.address) }</span>
                            <span>: { msg.message } </span>
                        </div>
                    )
                })}
            </Marquee>
        </div>
    )
}

function shortenAddress(addr: string): string {
    return addr.slice(0, 12);
}

export default GraffitiTicker;