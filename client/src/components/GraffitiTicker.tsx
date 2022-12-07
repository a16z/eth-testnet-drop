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
                                let censored = profanity.censor(evt!.args!['graffiti']);
                                let msg: Message = {
                                    address: evt!.args!['sender'],
                                    message: censored,
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

    let speed = window.innerWidth > 500 ? 15 : 6;

    return (
        <div className="fixed bottom-0 items-end w-screen graffiti">
            <Marquee gradient={false} gradientWidth={0} speed={speed} delay={2}>
                <div className="spacer"></div>
                { messages.length > 0 ? <h1 className="p-1 m-2">Graffiti</h1> : "" }
                { messages.map((msg, index) => {
                    return (
                        <div className="p-1 m-2 mx-4 border rounded-md graffiti-blob drop-shadow" key={index}>
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