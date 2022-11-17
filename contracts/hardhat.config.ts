import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-etherscan";

import NetworkConfig from "./network-config";;

import 'dotenv/config';

import { HardhatUserConfig } from "hardhat/types";
import { exit } from "process";

let etherscanApiKey = process.env.ETHERSCAN_API_KEY;
if (etherscanApiKey !== undefined) {
  etherscanApiKey = etherscanApiKey!;
} else {
  console.error("ETHERSCAN_API_KEY env var not set");
  exit(-1);
}

let config: HardhatUserConfig = {
  solidity: "0.8.16",
  etherscan: {
    apiKey: etherscanApiKey!
  },
  networks: {
    goerli: {
      url: NetworkConfig.getRpc("goerli"),
    },
    sepolia: {
      url: NetworkConfig.getRpc("sepolia")
    }
  },
};

export default config;
