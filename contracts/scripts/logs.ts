
import { Contract, providers } from "ethers";
import { exit } from "process";
import { parse } from "ts-command-line-args";
import { abi as CollectorAbi } from "../artifacts/contracts/Collector.sol/Collector.json";
import NetworkConfig from "../network-config";
import { createLogger, transports, format } from "winston";

interface Args {
    network: string,
    address: string,
    from_block: number,
    chunk_size: number
}

const args = parse<Args>({
    network: String,
    address: String,
    from_block: Number,
    chunk_size: Number,
});


let logger = createLogger({
    transports: [
        new transports.Console,
        new transports.File({
            dirname: "logs",
            filename: `querier_${args.network}.log`
        }),
    ],
    format: format.combine(
        format.timestamp(),
        format.splat(),
        format.printf(({timestamp, level, message}) => {
            return `[${timestamp}] ${level}: ${message}`
        })
    ),
})

let rpcUrl = NetworkConfig.getRpc(args.network);
if (rpcUrl === undefined) {
    logger.error(`Could not find config for ${args.network}`);
    exit(-1);
}

interface CollectionEvent {
    address: string,
    message: string,
    timestamp: number,
    block: number,
    tx: string,
}


getCollectionEvents(args.address, rpcUrl, args.from_block, args.chunk_size)
    .then(() => logger.info("Completed."))
    .catch(err => logger.error(err))

async function getCollectionEvents(collectorAddr: string, rpcUrl: string, fromBlock: number, chunkSize: number) { 
    let provider = new providers.JsonRpcProvider(rpcUrl);

    let contract = new Contract(collectorAddr, CollectorAbi, provider);
    let filter = contract.filters.Claim();
    let allCollectionEvents: CollectionEvent[] = [];

    let currentBlock = await provider.getBlockNumber();
    for (let from = fromBlock; from <= currentBlock; from += chunkSize) {
        let to = Math.min(from + chunkSize, currentBlock - 10);
        logger.info(`Querying from ${from} -> ${to}`);
        let events = await contract.queryFilter(filter, from, to);

        let collectionEvents = await Promise.all(
            events.map(async evt => {
                let block = await evt.getBlock();
                return {
                    address: evt!.args!['sender'],
                    message: evt!.args!['graffiti'],
                    timestamp: block.timestamp,
                    block: block.number,
                    tx: evt.transactionHash,
                } as CollectionEvent
        }))

        allCollectionEvents = allCollectionEvents.concat(collectionEvents);
    }

    logger.info(`Found ${allCollectionEvents.length} items from ${fromBlock} -> ${currentBlock - 10} on ${rpcUrl}.`);

    for (let collectionEvt of allCollectionEvents) {
        logger.info(`[${collectionEvt.timestamp} | ${collectionEvt.address}]: ${collectionEvt.message}`);
    }
}