import { useEffect, useState } from "react";
import { CollectionEvent, getAllCollectionEvents } from "../utils/query-logs";
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { profanity } from "@2toad/profanity";

export const Info = () => {
    let [collectionsData, setCollectionsData] = useState<CollectionEvent[]>([]);
    let [pctSepolia, setPctSepolia] = useState<number>(0);
    let [pctGoerli, setPctGoerli] = useState<number>(0);
    useEffect(() => {
        getAllCollectionEvents([setPctGoerli, setPctSepolia]).then(collectionEvents => {
            setCollectionsData(collectionEvents);
        });
    }, [])


    let cumulativeData = cumulative(collectionsData);

    if (collectionsData.length == 0) {
        return (
            <div className="m-2">
                <h2>Querying...</h2>
                <h3>This will take a while.</h3>
                <div>
                    Goerli: {(pctGoerli * 100).toFixed(2)}%
                </div>
                <div>
                    Sepolia: {(pctSepolia * 100).toFixed(2)}%
                </div>
            </div>
        )
    } else {
        return (
            <div className="p-4">
                <div>
                    <h2>Claims over time</h2>
                    <ResponsiveContainer width="100%" height={500}>
                        <AreaChart
                        data={cumulativeData}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" 
                                name = 'Time' 
                                type="number" 
                                tickFormatter={timeStr => {
                                    let date = new Date(timeStr);
                                    return `${date.getMonth()}/${date.getDay()} ${date.getHours()}:${date.getMinutes()}`
                                }} 
                                domain = {['auto', 'auto']}/>
                            <YAxis name="Claims"/>
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="Goerli" stackId="1" stroke="#8884d8" fill="#8884d8" />
                            <Area type="monotone" dataKey="Sepolia" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                            <Area type="monotone" dataKey="All" stackId="1" stroke="#ffc658" fill="#ffc658" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div>
                    <h2>All Graffiti</h2>
                    <div className="p-4 m-4 overflow-y-scroll text-left bg-white border h-60">
                        { collectionsData.map((collectionEvt, index) => {
                            return collectionEvt.message === "" ? 
                            "" 
                            : 
                            (
                                <div key={index}> 
                                    [{ collectionEvt.timestamp} | { collectionEvt.network} | { collectionEvt.address }] : { profanity.censor(collectionEvt.message) } 
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }
}

interface DataPoint {
    timestamp: number,
    amount: number,
    label: string,
}

interface CumulativePoint {
    timestamp: number,
    Goerli: number,
    Sepolia: number,
    All: number,
}

function cumulative(evts: CollectionEvent[]): CumulativePoint[] {
    let results = new Map<string, DataPoint[]>();
    for (let evt of evts) {
        let arr: DataPoint[] = results.get(evt.network) ? results.get(evt.network)! : [];
        let count = arr.length > 1 ? arr[arr.length - 1] : 0;
        arr.push({ timestamp: evt.timestamp, amount: count, label: evt.network} as DataPoint)
        results.set(evt.network, arr);
    }

    let sorted = Array.from(results.values()).flat().sort((a, b) => a.timestamp - b.timestamp);
    let sepoliaAmount = 0;
    let goerliAmount = 0;
    let allAmount = 0;
    let cumulativePoints: CumulativePoint[] = [];
    for (let point of sorted) {
        if (point.label === "Goerli") {
            goerliAmount += 1;
        }  else if (point.label === "Sepolia") {
            sepoliaAmount += 1;
        } else {
            console.error("Undefined network: ", point.label);
        }
        allAmount += 1;
        cumulativePoints.push({timestamp: point.timestamp, Goerli: goerliAmount, Sepolia: sepoliaAmount, All: allAmount});
    }
    return cumulativePoints;
}