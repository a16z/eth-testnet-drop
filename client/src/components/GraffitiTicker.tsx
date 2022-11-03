import { useEffect, useState } from 'react';
import { Contract } from 'ethers';
import Marquee from "react-fast-marquee";
import CurrentConfig from '../config';
import CollectorAbi from "../ABIs/Collector.json";
import { useProvider } from "wagmi";
import { profanity } from '@2toad/profanity';

interface Message {
    address: string,
    message: string,
}

let MAX_NUM_BLOCKS_QUERY = 10_000;

const GraffitiTicker = () => {
    let [messages, setMessages] = useState<Message[]>([]);

    let provider = useProvider();

    // Query for deposit logs
    useEffect(() => {
        // TODO: Query from multiple chains?
        let contract = new Contract(CurrentConfig.ContractAddr, CollectorAbi.abi, provider);
        let filter = contract.filters.Claim();
        provider.getBlockNumber()
            .then(blockNumber => {
                contract.queryFilter(filter, blockNumber - MAX_NUM_BLOCKS_QUERY)
                    .then(events => {
                        let messages = events.map(evt => {
                            let msg: Message = {
                                address: evt!.args!['sender'],
                                message: profanity.censor(evt!.args!['graffiti'])
                            }
                            return msg;
                        });
                        messages = messages.filter((msg) => msg.message !== "");
                        setMessages(messages);
                    })
                    .catch(err => console.error(err))
            })
            .catch(err => console.error(err))
    })

    return (
        <div className="fixed bottom-0 graffiti w-full items-end">
            <Marquee gradient={false} gradientWidth={0} speed={100}>
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