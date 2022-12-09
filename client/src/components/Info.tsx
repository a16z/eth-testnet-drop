import { useEffect, useState } from "react";
import { CollectionEvent, getAllCollectionEvents } from "../utils/query-logs";
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { profanity } from "@2toad/profanity";
import moment from "moment";

export const Info = () => {
    let [collectionsData, setCollectionsData] = useState<CollectionEvent[]>([]);
    let [cumulativeData, setCumulativeData] = useState<CumulativePoint[]>([]);
    let [pctSepolia, setPctSepolia] = useState<number>(0);
    let [pctGoerli, setPctGoerli] = useState<number>(0);
    useEffect(() => {
        getAllCollectionEvents(true, [setPctGoerli, setPctSepolia]).then(collectionEvents => {
            let cumulativeData = cumulative(collectionEvents).sort((a,b) => a.timestamp - b.timestamp); // todo: move to useeffect
            setCollectionsData(collectionEvents);
            setCumulativeData(cumulativeData);
        });
    }, [])



    if (collectionsData.length === 0) {
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
        let goerliNumClaimed = cumulativeData[cumulativeData.length - 1].Goerli;
        let sepoliaNumClaimed = cumulativeData[cumulativeData.length - 1].Sepolia;
        return (
            <div className="p-4">
                <div className="pb-4 border-b">
                    <h2 className="text-2xl">Claims over time</h2>
                    <ResponsiveContainer width="100%" height={500}>
                        <AreaChart
                        data={cumulativeData}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" 
                                name = 'Time' 
                                type="number"
                                tickFormatter={formatEpoch} 
                                domain = {[formatEpoch(cumulativeData[0].timestamp), formatEpoch(cumulativeData[cumulativeData.length - 1].timestamp)]}/>
                            <YAxis name="Claims"/>
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="Goerli" stackId="1" stroke="#8884d8" fill="#8884d8" />
                            <Area type="monotone" dataKey="Sepolia" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="py-4 border-b">
                    <h2 className="text-2xl">Percentage claimed</h2>
                    <div className="flex grid grid-cols-2">
                        <div>
                            <h1 className="text-4xl">
                                { (goerliNumClaimed / 450_000 * 100).toFixed(3) }%
                            </h1>
                            <div>Goerli claimed</div>
                        </div>
                        <div>
                            <h1 className="text-4xl">
                                { (sepoliaNumClaimed / 450_000 * 100).toFixed(3) }%
                            </h1>
                            <div>Sepolia claimed</div>
                        </div>
                    </div>
                </div>

                <div className="py-4">
                    <h2 className="text-2xl">All Graffiti</h2>
                    <div className="p-4 m-4 overflow-x-scroll overflow-y-scroll text-xs text-left bg-white border border-rounded-md" style={{height: "50vh"}}>
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

function formatEpoch(epochMillis: number): string {
    return moment.unix(epochMillis / 1000).format("MM/DD HH:ss");
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
    let cumulativePoints: CumulativePoint[] = [];
    for (let point of sorted) {
        if (point.label === "Goerli") {
            goerliAmount += 1;
        }  else if (point.label === "Sepolia") {
            sepoliaAmount += 1;
        } else {
            console.error("Undefined network: ", point.label);
        }
        cumulativePoints.push({timestamp: point.timestamp, Goerli: goerliAmount, Sepolia: sepoliaAmount});
    }
    return cumulativePoints;
}