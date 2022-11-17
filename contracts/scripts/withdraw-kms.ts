import { BigNumber, Contract, providers } from "ethers";
import { GcpKmsSigner } from "ethers-gcp-kms-signer";
import { exit } from "process";
import { parse } from "ts-command-line-args";
import NetworkConfig from "../network-config";
import getKmsCredentials from "../utils/kms";
import { abi as CollectorAbi } from "../artifacts/contracts/Collector.sol/Collector.json";

interface Args {
    network: string,
    address: string,
    amount?: string,
}

export async function withdrawKms() {
    const args = parse<Args>({
        network: String,
        address: String,
        amount: {type: String, optional: true},
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

    let contract = new Contract(args.address, CollectorAbi, signer);
    let amount = args.amount === undefined ? await provider.getBalance(contract.address) : BigNumber.from(args.amount);

    let tx = await contract.adminWithdraw(amount);
    console.log(`Sent adminWithdraw tx: ${tx.hash}`);
    await tx.wait();
    console.log("Included.")
}

withdrawKms().then().catch(err => {
    console.error(err);
    exit(-1);
})