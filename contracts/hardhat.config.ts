import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import { task } from "hardhat/config";
import { deploy } from "./scripts/deploy";

import 'dotenv/config';

import { HardhatUserConfig } from "hardhat/types";
import { exit } from "process";

let pk = process.env.DEPLOY_PK;
if (pk) {
    pk = pk!;
} else {
    console.error("DEPLOY_PK env var not set.");
    exit(-1);
}

let alchemyApiKey = process.env.ALCHEMY_API_KEY;
if (alchemyApiKey) {
  alchemyApiKey = alchemyApiKey!;
} else {
  console.error("ALCHEMY_API_KEY not set.");
  exit(-1);
}

task("deploy", "deploy")
  .addParam("file")
  .setAction(async (params, hre) => {
    await deploy(hre, params.file).then(() => {}).catch(err => console.error(err))
  })

let config: HardhatUserConfig = {
  solidity: "0.8.16",
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${alchemyApiKey}`,
      accounts: [pk]
    }
  }
};

export default config;
