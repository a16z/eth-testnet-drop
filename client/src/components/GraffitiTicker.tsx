import { useEffect, useState } from 'react';
import Marquee from "react-fast-marquee";
import { profanity } from '@2toad/profanity';
import { getAllCollectionEvents } from '../utils/query-logs';


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
        let fetch = async () => {
            let collectionEvents = await getAllCollectionEvents()
            let msgs = collectionEvents
                .filter(evt => evt.message !== "")
                .map(evt => {
                    return {
                        address: evt.address, 
                        message: profanity.censor(evt.message), 
                        timestamp: evt.timestamp, 
                        tx: evt.tx
                    } as Message})
            setMessages(msgs);
        }
        fetch().catch(console.error)
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