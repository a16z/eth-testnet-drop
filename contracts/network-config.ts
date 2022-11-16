import { exit } from "process";

let alchemyApiKey = process.env.ALCHEMY_API_KEY;
if (alchemyApiKey) {
  alchemyApiKey = alchemyApiKey!;
} else {
  console.error("ALCHEMY_API_KEY not set.");
  exit(-1);
}

interface Network {
    name: string,
    rpcUrl: string,
}

let networks: Network[] = 
[
    {
        name: "anvil8500",
        rpcUrl: "http://localhost:8500"
    },
    {
        name: "anvil8501",
        rpcUrl: "http://localhost:8501"
    },
    {
        name: "goerli",
        rpcUrl: `https://eth-goerli.alchemyapi.io/v2/${alchemyApiKey}`,
    },
    {
        name: "sepolia",
        rpcUrl: "https://rpc.sepolia.dev"
    }
]

export default class NetworkConfig {
    public static getRpc(networkName: string): undefined | string {
        return networks.find(network => network.name.toLowerCase() === networkName.toLowerCase())?.rpcUrl;
    }
}
