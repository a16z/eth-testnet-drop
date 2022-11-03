
import "@nomiclabs/hardhat-ethers";
import { ethers, network } from "hardhat";
import 'dotenv/config';
import { exit } from "process";
import { generateSaveTree, transferEth } from "../utils/utils";
import MerkleTree from "merkletreejs";
import keccak256 from "keccak256";
import { Signer } from "ethers";

let DEAFULT_LEAVES_FILE = "local-mt.txt";

export async function deployDev(leavesFile: string = DEAFULT_LEAVES_FILE) {
    // Reset
    await network.provider.send("hardhat_reset");

    // Pull dev wallet address
    let address = process.env.DEV_WALLET;
    if (address) {
        address = address!;
    } else {
        console.error("DEV_WALLET env var not set.");
        exit(-1);
    }

    let [signer] = await ethers.getSigners();

    let allAddresses = generateSaveTree([address], 100, leavesFile);
    await deployCollector(allAddresses, signer);
    await transferEth(address, signer);
}

export async function deployCollector(leaves: string[] = [], signer: Signer) {
    console.log("leaves! ", leaves);
    let merkleTree = new MerkleTree(leaves, keccak256, { hashLeaves: true, sortPairs: true });
    let root = merkleTree.getHexRoot();

    let factory = await (await ethers.getContractFactory("Collector")).connect(signer);
    let deploy = await factory.deploy(root);
    await deploy.deployTransaction.wait();
    console.log(`Deploy address: ${deploy.address}`);
}

deployDev().then(() => {}).catch(err => console.error(err))