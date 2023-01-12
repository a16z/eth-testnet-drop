import { DynamicRPCProviders, useDynamicContext } from "@dynamic-labs/sdk-react";
import { Provider } from "@wagmi/core";
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
    rpcProviders: DynamicRPCProviders,
    sinceDeploy: boolean = false,
    progressCallbacks?: Dispatch<SetStateAction<number>>[]): Promise<CollectionEvent[]> {
    let all = await Promise.all(
            CurrentConfig.Chains.map(async (chainConfig, index) => {
                let chainId = chainConfig.Chain.id;
                let provider = rpcProviders.getEvmRpcProviderByChainId(chainId)!.provider;
                let address = chainConfig.ContractAddr;

                let fromBlock:number
                if (sinceDeploy) {
                    fromBlock = chainConfig.ContractDeployBlock;
                } else {
                    let currentBlock = await provider.getBlockNumber();
                    fromBlock = currentBlock - CurrentConfig.GraffitiMaxBlocks;
                    fromBlock = fromBlock > 0 ? fromBlock : 0;
                }

                let collectionEvents: CollectionEvent[] = await getCollectionEvents(
                    address, 
                    // rpcUrl, 
                    provider,
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
        provider: Provider,
        fromBlock: number, 
        chunkSize: number,
        chainId: number,
        network: string,
        progressCallback?: Dispatch<SetStateAction<number>>): Promise<CollectionEvent[]> { 

    let contract = new Contract(collectorAddr, CollectorAbi.abi, provider);
    let filter = contract.filters.Claim();
    let allCollectionEvents: CollectionEvent[] = [];

    let currentBlock = await provider.getBlockNumber();
    let queryOffset = 10; // in case node is behind
    let range = currentBlock - queryOffset - fromBlock;
    for (let from = fromBlock; from <= currentBlock - queryOffset; from += chunkSize) {
        let to = Math.min(from + chunkSize, currentBlock - queryOffset);

        let pct = (to - fromBlock) / (range);
        if (progressCallback) {
            progressCallback(pct);
        }

        let numFailures = 0;
        let events: any[] = [];
        while (numFailures < 10) {
            try {
                events = await contract.queryFilter(filter, from, to);
                break;
            } catch (err) {
                console.error("Query failed ", err)
                numFailures += 1;
            }
        }

        let collectionEvents = events.map(evt => {
            return {
                address: evt!.args!['sender'],
                message: evt!.args!['graffiti'],
                timestamp: 0,
                block: evt.blockNumber,
                tx: evt.transactionHash,
                network
            } as CollectionEvent
        })


        allCollectionEvents = allCollectionEvents.concat(collectionEvents);
    }

    // Approximation optimization to cut down on RPCs
    let currentTime = new Date().getTime();
    let blockTime = 13000;
    for (let evt of allCollectionEvents) {
        evt.timestamp = currentTime - (blockTime * (currentBlock - evt.block));
    }

    return allCollectionEvents;
}