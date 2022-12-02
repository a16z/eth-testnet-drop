import { utils } from "ethers"
import { ethers } from "hardhat"
import { Duster__factory } from "../typechain-types";
import { expect } from "chai";
var crypto = require('crypto');

describe("Duster.sol", () => {
    it("dusts with transfer", async () => {
        let AMOUNT = utils.parseEther("1")
        let NUM = 100;
        let TRANSFER = AMOUNT.mul(NUM);

        let [owner] = await ethers.getSigners();
        let factory = new Duster__factory(owner);
        let deploy = await factory.deploy();

        await deploy.deployTransaction.wait();

        let addressesToDust = generateAddresses(NUM);

        await expect(deploy.dust(addressesToDust, AMOUNT, { value: TRANSFER })).to.not.be.reverted;

        for (let address of addressesToDust) {
            let balance = await owner.provider!.getBalance(address);
            expect(balance.toHexString()).to.be.eq(AMOUNT.toHexString());
        }
    })

    it("dusts with pre-transfer", async () => {
        let AMOUNT = utils.parseEther("1")
        let NUM = 100;
        let TRANSFER = AMOUNT.mul(NUM);

        let [owner] = await ethers.getSigners();
        let factory = new Duster__factory(owner);
        let deploy = await factory.deploy();

        await deploy.deployTransaction.wait();
        await expect(owner.sendTransaction({ to: deploy.address, value: TRANSFER })).to.not.be.reverted;

        let addressesToDust = generateAddresses(NUM);

        await expect(deploy.dust(addressesToDust, AMOUNT)).to.not.be.reverted;

        for (let address of addressesToDust) {
            let balance = await owner.provider!.getBalance(address);
            expect(balance.toHexString()).to.be.eq(AMOUNT.toHexString());
        }
    })

    it("can remove", async () => {
        let PRE_AMOUNT = utils.parseEther("1")

        let [owner, other] = await ethers.getSigners();
        let factory = new Duster__factory(owner);
        let deploy = await factory.deploy();
        await deploy.deployTransaction.wait();
        await expect(other.sendTransaction({ to: deploy.address, value: PRE_AMOUNT })).to.not.be.reverted;
        let preAmount = await other.provider!.getBalance(deploy.address);
        expect(preAmount.toHexString()).to.be.eq(PRE_AMOUNT);

        await expect(deploy.connect(other).pull(PRE_AMOUNT)).to.be.reverted;
        await expect(deploy.connect(owner).pull(PRE_AMOUNT)).to.not.be.reverted;
        let amount = await other.provider!.getBalance(deploy.address);
        expect(amount.toNumber()).to.be.eq(0);
    })
})

function generateAddresses(num: number): string[] {
    let addresses: string[] = [];
    for (let i = 0; i < num; i++) {
        let pk = "0x" + crypto.randomBytes(32).toString('hex');
        let wallet = new ethers.Wallet(pk);
        addresses.push(wallet.address);
    }
    return addresses;
}