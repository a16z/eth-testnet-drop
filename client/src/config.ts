import { Chain } from "wagmi";
import { goerli, sepolia } from "wagmi/chains";

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
		default: {
			http: ["http://localhost:8500"],
		},
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
		default: {
			http: ["http://localhost:8501"],
		},
	},
};

export interface ChainConfig {
	ContractAddr: `0x${string}`;
	ContractDeployBlock: number;
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
			ContractDeployBlock: 0,
			Chain: Anvil8500Chain,
			HumanNetworkName: "Anvil8500",
			BlockExplorerUrl: "https://not-real-explorer.io/",
		},
		{
			ContractAddr: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
			ContractDeployBlock: 0,
			Chain: Anvil8501Chain,
			HumanNetworkName: "Anvil8501",
			BlockExplorerUrl: "https://not-real-explorer.io/",
		},
	],
	MerkleTreePath: "/combined_qualifying_addresses_Nov15.txt",
	ShowGraffiti: true,
	GraffitiMaxBlocks: 1000,
};

const ProdConfig: Config = {
	Chains: [
		{
			ContractAddr: "0xc638f625aC0369d56D55106affbD5b83872Db971",
			ContractDeployBlock: 8076460,
			Chain: goerli,
			HumanNetworkName: "Goerli",
			BlockExplorerUrl: "https://goerli.etherscan.io/tx/",
		},
		{
			ContractAddr: "0x4ed9c70E9A5C6a116365EB8A9e2cf442dECA71C7",
			ContractDeployBlock: 2414647,
			Chain: sepolia,
			HumanNetworkName: "Sepolia",
			BlockExplorerUrl: "https://sepolia.etherscan.io/tx/",
		},
	],
	MerkleTreePath: "/combined_qualifying_addresses_Nov15.txt",
	ShowGraffiti: true,
	GraffitiMaxBlocks: 1000,
};

let CurrentConfig =
	process.env.NODE_ENV === "production" ? ProdConfig : LocalConfig;

export default CurrentConfig;
