import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "@nomicfoundation/hardhat-chai-matchers";

import 'dotenv/config';

import { HardhatUserConfig } from "hardhat/types";

let config: HardhatUserConfig = {
  solidity: "0.8.16",
};

export default config;
