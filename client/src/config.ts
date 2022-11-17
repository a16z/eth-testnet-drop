import { Chain, chain } from "wagmi";

const Anvil8500Chain: Chain = {
	id: 8500,
	name: "Anvil 8500",
	network: "Anvil",
	nativeCurrency: {
		decimals: 18,
		name: "Anvil ETH",
		symbol: "AETH",
	},
	rpcUrls: {
		default: "http://localhost:8500",
	},
};

const Anvil8501Chain: Chain = {
	id: 8501,
	name: "Anvil 8501",
	network: "Anvil",
	nativeCurrency: {
		decimals: 18,
		name: "Anvil ETH",
		symbol: "AETH",
	},
	rpcUrls: {
		default: "http://localhost:8501",
	},
};

export interface ChainConfig {
	ContractAddr: string;
	HumanNetworkName: string;
	Chain: Chain;
	BlockExplorerUrl: string;
}

export interface Config {
	Chains: ChainConfig[];
	MerkleTreePath: string;
	ShowGraffiti: boolean;
	GraffitiMaxBlocks: number;
}

const LocalConfig: Config = {
	Chains: [
		{
			ContractAddr: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
			Chain: Anvil8500Chain,
			HumanNetworkName: "Anvil8500",
			BlockExplorerUrl: "https://not-real-explorer.io/",
		},
		{
			ContractAddr: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
			Chain: Anvil8501Chain,
			HumanNetworkName: "Anvil8501",
			BlockExplorerUrl: "https://not-real-explorer.io/",
		},
	],
	MerkleTreePath: "/big-local-mt.txt",
	ShowGraffiti: true,
	GraffitiMaxBlocks: 1000,
};

const ProdConfig: Config = {
	Chains: [
		{
			ContractAddr: "0x88D942e428eAE015486A6C94A8869D5e3C989415",
			Chain: chain.goerli,
			HumanNetworkName: "Goerli",
			BlockExplorerUrl: "https://goerli.etherscan.io/tx/",
		},
		{
			ContractAddr: "0x88D942e428eAE015486A6C94A8869D5e3C989415",
			Chain: chain.sepolia,
			HumanNetworkName: "Sepolia",
			BlockExplorerUrl: "https://sepolia.etherscan.io/tx/",
		},
	],
	MerkleTreePath: "/big-local-mt.txt",
	ShowGraffiti: true,
	GraffitiMaxBlocks: 1000,
};

let CurrentConfig =
	process.env.NODE_ENV === "production" ? ProdConfig : LocalConfig;

export default CurrentConfig;
