import { exit } from "process";

import 'dotenv/config';

let alchemyApiKey = process.env.ALCHEMY_API_KEY;
if (alchemyApiKey) {
  alchemyApiKey = alchemyApiKey!;
} else {
  console.error("ALCHEMY_API_KEY not set.");
  exit(-1);
}
let infuraApiKey= process.env.INFURA_API_KEY;
if (infuraApiKey) {
  infuraApiKey = infuraApiKey!;
} else {
  console.error("INFURA_API_KEY not set.");
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
        rpcUrl: `https://sepolia.infura.io/v3/${infuraApiKey}`
    }
]

export default class NetworkConfig {
    public static getRpc(networkName: string): undefined | string {
        return networks.find(network => network.name.toLowerCase() === networkName.toLowerCase())?.rpcUrl;
    }
}
