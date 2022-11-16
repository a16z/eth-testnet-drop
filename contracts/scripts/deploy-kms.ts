import { GcpKmsSigner } from "ethers-gcp-kms-signer";
import { ContractFactory, providers } from "ethers";
import { exit } from "process";
import { parse } from "ts-command-line-args";
import NetworkConfig from "../network-config";
import { existsSync, readFileSync } from "fs";
import MerkleTree from "merkletreejs";
import keccak256 from "keccak256";
import { abi as CollectorAbi, bytecode as CollectorBytecode } from "../artifacts/contracts/Collector.sol/Collector.json";
import getKmsCredentials from "../utils/kms";

interface Args {
    network: string,
    amount: number,
    leaves_file: string
}

export async function deployKms() {
    const args = parse<Args>({
        network: String,
        amount: Number,
        leaves_file: String,
    });

    let rpcUrl = NetworkConfig.getRpc(args.network);
    if (rpcUrl === undefined) {
        console.error(`Could not find config for ${args.network}`);
        exit(-1);
    }
    if (!existsSync(args.leaves_file)) {
        console.error(`${args.leaves_file} does not exst.`);
        exit(-1);
    }

    let provider = new providers.JsonRpcProvider(rpcUrl!);
    let kmsCredentials = getKmsCredentials();
    let signer = new GcpKmsSigner(kmsCredentials);
    signer = signer.connect(provider);
    console.log(`Connected to gcloud KMS with address: ${await signer.getAddress()}`);

    let addresses = readFileSync(args.leaves_file).toString().split(",");
    let merkleTree = new MerkleTree(addresses, keccak256, { hashLeaves: true, sortPairs: true });
    let root = merkleTree.getHexRoot();
    let factory = new ContractFactory(CollectorAbi, CollectorBytecode, signer);
    let deploy = await factory.deploy(root, args.amount);
    await deploy.deployTransaction.wait();
    console.log(`Deployed to ${deploy.address}`);
}

deployKms().then().catch(err => {
    console.error(err);
    exit(-1);
})