import { ethers } from "hardhat";
import { Collector__factory } from "../typechain-types";
import { expect } from "chai";
import keccak256 from "keccak256";
import MerkleTree from "merkletreejs";
import { utils } from "ethers";

describe("Collector.sol", () => {
    it("claim flows", async () => {
        let DEPOSIT_AMOUNT = utils.parseEther("1000");
        let CLAIM_AMOUNT = utils.parseEther("10");

        let signers = await ethers.getSigners();
        let addrs = await Promise.all(signers.map(s => s.getAddress()));

        let merkleTree = new MerkleTree(addrs, keccak256, { hashLeaves: true, sortPairs: true});
        let root = merkleTree.getHexRoot();

        let factory = new Collector__factory(signers[0]);
        let deploy = await factory.deploy(root, CLAIM_AMOUNT);

        await deploy.deployTransaction.wait();

        // Transfer fails for wrong address
        let signer1Addr = await signers[1].getAddress();
        let leaf = keccak256(signer1Addr);
        let proof = merkleTree.getHexProof(leaf);
        await expect(deploy.collect(proof, "I am a graffiti", signer1Addr)).to.be.revertedWith("Failed merkle proof");

        // Transfer fails for insufficient funds
        deploy = deploy.connect(signers[1]);
        proof = merkleTree.getHexProof(leaf);
        await expect(deploy.collect(proof, "I am a graffiti", signer1Addr)).to.be.revertedWith("Insufficient funds");

        await (await signers[1].sendTransaction({to: deploy.address, value: DEPOSIT_AMOUNT})).wait()

        // Transfer succeeds for valid withdraw
        let preBalance = await signers[1].getBalance();
        await expect(deploy.collect(proof, "I am a graffiti", signer1Addr)).to.not.be.reverted;
        let postBalance = await signers[1].getBalance();
        expect(postBalance.gt(preBalance)).to.be.true;

        // Already claimed fails
        await expect(deploy.collect(proof, "I a a graffiti", signer1Addr)).to.be.revertedWith("Already claimed");

    })

    it("admin permissions", async () => {
        let DEPOSIT_AMOUNT = utils.parseEther("150");
        let CLAIM_AMOUNT = utils.parseEther("0.1");
        let WITHDRAW_AMOUNT = utils.parseEther("100");

        let signers = await ethers.getSigners();
        let addrs = await Promise.all(signers.map(s => s.getAddress()));

        let merkleTree = new MerkleTree(addrs, keccak256, { hashLeaves: true, sortPairs: true});
        let root = merkleTree.getHexRoot();

        let factory = new Collector__factory(signers[0]);
        let deploy = await factory.deploy(root, CLAIM_AMOUNT);

        await deploy.deployTransaction.wait();
        await (await signers[1].sendTransaction({to: deploy.address, value: DEPOSIT_AMOUNT})).wait()

        let preBalance = await signers[0].getBalance();

        await expect(deploy.connect(signers[1]).adminWithdraw(WITHDRAW_AMOUNT)).to.be.revertedWith("Ownable: caller is not the owner");
        await expect(deploy.connect(signers[0]).adminWithdraw(WITHDRAW_AMOUNT)).to.not.be.reverted;

        let postBalance = await signers[0].getBalance();
        expect(postBalance.gt(preBalance)).to.be.true;

        await expect(deploy.connect(signers[1]).adminUpdateRoot(root)).to.be.revertedWith("Ownable: caller is not the owner");
        await expect(deploy.connect(signers[0]).adminUpdateRoot(root)).to.not.be.reverted;
    })
})