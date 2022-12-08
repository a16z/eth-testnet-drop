import { Contract, providers } from "ethers";
import { Dispatch, SetStateAction } from "react";
import CollectorAbi from "../ABIs/Collector.json";
import CurrentConfig from "../config";

export interface CollectionEvent {
    address: string,
    message: string,
    timestamp: number,
    block: number,
    tx: string,
    network: string
}

export async function getAllCollectionEvents(
    progressCallbacks?: Dispatch<SetStateAction<number>>[]): Promise<CollectionEvent[]> {
    let all = await Promise.all(
            CurrentConfig.Chains.map(async (chainConfig, index) => {
                let chainId = chainConfig.Chain.id;
                let rpcUrl = chainConfig.Chain.rpcUrls.default;
                let address = chainConfig.ContractAddr;
                let provider = new providers.JsonRpcProvider(rpcUrl, chainId);
                let currentBlock = await provider.getBlockNumber();
                let fromBlock = currentBlock - CurrentConfig.GraffitiMaxBlocks;
                fromBlock = fromBlock > 0 ? fromBlock : 0;
                let collectionEvents: CollectionEvent[] = await getCollectionEvents(
                    address, 
                    rpcUrl, 
                    fromBlock, 
                    CurrentConfig.GraffitiMaxBlocks,
                    chainId,
                    chainConfig.Chain.name,
                    progressCallbacks ? progressCallbacks![index] : undefined);
                return collectionEvents;
    }));

    return all.flat().sort((a, b) => b.timestamp - a.timestamp);
}

export async function getCollectionEvents(
        collectorAddr: string, 
        rpcUrl: string, 
        fromBlock: number, 
        chunkSize: number,
        chainId: number,
        network: string,
        progressCallback?: Dispatch<SetStateAction<number>>): Promise<CollectionEvent[]> { 
    let provider = new providers.JsonRpcProvider(rpcUrl, chainId);

    let contract = new Contract(collectorAddr, CollectorAbi.abi, provider);
    let filter = contract.filters.Claim();
    let allCollectionEvents: CollectionEvent[] = [];

    let currentBlock = await provider.getBlockNumber();
    let range = currentBlock - fromBlock;
    for (let from = fromBlock; from <= currentBlock - 5; from += chunkSize) {
        let to = Math.min(from + chunkSize, currentBlock - 5);
        let pct = (to - fromBlock) / range;
        if (progressCallback) {
            progressCallback(pct);
        }
        let events = await contract.queryFilter(filter, from, to);

        let collectionEvents = await Promise.all(
            events.map(async evt => {
                return {
                    address: evt!.args!['sender'],
                    message: evt!.args!['graffiti'],
                    timestamp: 0,
                    block: evt.blockNumber,
                    tx: evt.transactionHash,
                    network
                } as CollectionEvent
        }))


        allCollectionEvents = allCollectionEvents.concat(collectionEvents);
    }

    let currentTime = new Date().getTime();
    let blockTime = 13;

    for (let evt of allCollectionEvents) {
        evt.timestamp = currentTime - (blockTime * (currentBlock - evt.block));
    }

    return allCollectionEvents;
}