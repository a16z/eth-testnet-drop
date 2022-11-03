import { ethers } from "hardhat";
import { Collector__factory } from "../typechain-types";
import { expect } from "chai";
import keccak256 from "keccak256";
import MerkleTree from "merkletreejs";

describe("test", () => {
    it("deploys the Collector", async () => {
        let signers = await ethers.getSigners();
        let addrs = await Promise.all(signers.map(s => s.getAddress()));
        console.log(addrs.length);

        let merkleTree = new MerkleTree(addrs, keccak256, { hashLeaves: true, sortPairs: true});
        let root = merkleTree.getHexRoot();

        let factory = new Collector__factory(signers[0]);
        let deploy = await factory.deploy(root);

        console.log(`Collector address (not deployed yet): ${deploy.address}`);
        await deploy.deployTransaction.wait();

        let leaf = keccak256(addrs[1]);
        let proof = merkleTree.getHexProof(leaf);
        await (await deploy.collect(proof, leaf, "MEOW")).wait();
    })
})