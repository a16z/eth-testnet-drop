import { exit } from "process";
import { BigNumber, providers } from "ethers";
import NetworkConfig from "../network-config";
import { parse } from "ts-command-line-args";
import { GcpKmsSigner } from "ethers-gcp-kms-signer";
import getKmsCredentials from "../utils/kms";

interface Args {
    network: string,
    amount: string,
    to_address: string
}

export async function transferKms() {
    const args = parse<Args>({
        network: String,
        amount: String,
        to_address: String,
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

    let amount = BigNumber.from(args.amount);
    let tx = await signer.sendTransaction({to: args.to_address, value: amount});
    await tx.wait();
    console.log(`Sent ${amount.toString()}wei to ${args.to_address} over ${rpcUrl}. Tx: ${tx.hash}`);
}

transferKms().then().catch(err => {
    console.error(err);
    exit(-1);
})