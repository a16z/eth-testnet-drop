
import "@nomiclabs/hardhat-ethers";
import { ethers, network } from "hardhat";
import 'dotenv/config';
import { exit } from "process";
import { generateSaveTree, transferEth } from "../utils/utils";
import MerkleTree from "merkletreejs";
import keccak256 from "keccak256";
import { BigNumber, Signer, utils } from "ethers";

let DEAFULT_LEAVES_FILE = "local-mt.txt";
let CLAIM_AMOUNT = utils.parseEther("10");
let DEPOSIT_AMOUNT = utils.parseEther("100");

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

    // Transfer ETH to cover gas
    await transferEth(address, signer, utils.parseEther("2.0"));
}

export async function deployCollector(leaves: string[] = [], signer: Signer) {
    console.log("leaves! ", leaves);
    let merkleTree = new MerkleTree(leaves, keccak256, { hashLeaves: true, sortPairs: true });
    let root = merkleTree.getHexRoot();

    let factory = await (await ethers.getContractFactory("Collector")).connect(signer);
    let deploy = await factory.deploy(root, CLAIM_AMOUNT);
    await deploy.deployTransaction.wait();
    console.log(`Deploy address: ${deploy.address}`);

    await (await signer.sendTransaction({to: deploy.address, value: DEPOSIT_AMOUNT})).wait();
}

deployDev().then(() => {}).catch(err => console.error(err))