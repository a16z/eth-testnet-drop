import { GcpKmsSigner } from "ethers-gcp-kms-signer";
import { providers } from "ethers";
import { exit } from "process";
import { parse } from "ts-command-line-args";
import NetworkConfig from "../../network-config";
import { Duster__factory } from "../../typechain-types";
import getKmsCredentials from "../../utils/kms";

interface Args {
    network: string,
}

export async function deployKms() {
    const args = parse<Args>({
        network: String,
    });

    let rpcUrl = NetworkConfig.getRpc(args.network);
    if (rpcUrl === undefined) {
        console.error(`Could not find config for ${args.network}`);
        exit(-1);
    }

    let provider = new providers.JsonRpcProvider(rpcUrl!);
    let kmsCredentials = getKmsCredentials();
    let signer = new GcpKmsSigner(kmsCredentials);
    signer = signer.connect(provider);
    console.log(`Connected to gcloud KMS with address: ${await signer.getAddress()}`);

    let factory = new Duster__factory(signer);
    let deploy = await factory.deploy();
    await deploy.deployTransaction.wait();
    console.log(`Deployed to ${deploy.address}`);
    console.log(`Verify on etherscan: npx hardhat verify --network ${args.network} ${deploy.address}`)
}

deployKms().then().catch(err => {
    console.error(err);
    exit(-1);
})