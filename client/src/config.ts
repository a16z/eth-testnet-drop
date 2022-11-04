import { Chain, chain } from "wagmi";

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

export interface ChainConfig {
    ContractAddr: string,
    HumanNetworkName: string,
    Chain: Chain,
}

export interface Config {
    Chains: ChainConfig[],
    MerkleTreePath: string,
    ShowGraffiti: boolean,
    GraffitiMaxBlocks: number
}

const LocalConfig: Config = {
    Chains: [
        {
            ContractAddr: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
            Chain: Anvil8500Chain,
            HumanNetworkName: "Anvil8500",
        },
        {
            ContractAddr: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
            Chain: Anvil8501Chain,
            HumanNetworkName: "Anvil8501",
        }
    ],
    MerkleTreePath: "/local-mt.txt",
    ShowGraffiti: true,
    GraffitiMaxBlocks: 1000
}

const ProdConfig: Config = {
    Chains: [
        {
            ContractAddr: "0x4c4871965c01B8f33F2773fa55167BA983C729ad",
            Chain: chain.goerli,
            HumanNetworkName: "Goerli",
        },
        {
            ContractAddr: "0x4c4871965c01B8f33F2773fa55167BA983C729ad",
            Chain: chain.sepolia,
            HumanNetworkName: "Sepolia",
        }
    ],
    MerkleTreePath: "/mt.txt",
    ShowGraffiti: true,
    GraffitiMaxBlocks: 1000
}

let CurrentConfig = process.env.NODE_ENV === 'production' ? ProdConfig : LocalConfig;

export default CurrentConfig;
