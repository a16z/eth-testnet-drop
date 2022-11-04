import { Chain, chain } from "wagmi";

interface Config {
    ContractAddr: string,
    NetworkName: string,
    MerkleTreePath: string,
    ChainId: number,
    ShowGraffiti: boolean,
    GraffitiMaxBlocks: number,
    Chains: Chain[]
}

const Anvil8500Chain: Chain = {
    id: 8500,
    name: "Anvil 8500",
    network: "Anvil",
    nativeCurrency: {
        decimals: 18,
        name: 'Anvil ETH',
        symbol: 'AETH'
    },
    rpcUrls: {
        default: 'http://localhost:8500'
    }
}

const Anvil8501Chain: Chain = {
    id: 8501,
    name: "Anvil 8501",
    network: "Anvil",
    nativeCurrency: {
        decimals: 18,
        name: 'Anvil ETH',
        symbol: 'AETH'
    },
    rpcUrls: {
        default: 'http://localhost:8501'
    }
}

const GoerliConfig: Config = {
    ContractAddr: "0x4c4871965c01B8f33F2773fa55167BA983C729ad",
    NetworkName: "Goerli",
    MerkleTreePath: "/mt.txt",
    ChainId: 5,
    ShowGraffiti: true,
    GraffitiMaxBlocks: 1000, // Ankr RPC doesn't allow 10k
    Chains: [chain.hardhat, chain.goerli, chain.sepolia],  // TODO: Make more better
}

const LocalConfig: Config = {
    ContractAddr: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    NetworkName: "Hardhat", // TODO: Adjust
    MerkleTreePath: "./local-mt.txt",
    ChainId: 8500,
    ShowGraffiti: true,
    GraffitiMaxBlocks: 10_000,
    Chains: [Anvil8500Chain, Anvil8501Chain]
}


let CurrentConfig = process.env.NODE_ENV === 'production' ? GoerliConfig : LocalConfig;

export default CurrentConfig;
