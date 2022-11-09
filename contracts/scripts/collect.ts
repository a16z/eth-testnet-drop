import MerkleTree from "merkletreejs";
import keccak256 from "keccak256";
import { parse } from "ts-command-line-args";
import { Wallet, providers, Contract } from "ethers";
import { existsSync, readFileSync } from "fs";
import { exit } from "process";
import { abi as CollectorAbi } from "../artifacts/contracts/Collector.sol/Collector.json";

interface Args {
    pk: string;
    rpc: string;
    leaves_file: string;
    contract_address: string;
    graffiti?: string;
    recipient?: string;
}

export async function collect() {
    // Cmd flags for PK, RPC, Opt<Recipient>
    const args = parse<Args>({
        pk: String,
        rpc: String,
        leaves_file: String,
        contract_address: String,
        graffiti:  {type: String, optional: true},
        recipient: { type: String, optional: true}
    });

    // Connect ethers
    let provider = new providers.JsonRpcProvider(args.rpc);
    let wallet = new Wallet(args.pk, provider);

    // Merkle proof
    if (!existsSync(args.leaves_file)) {
        console.error(`${args.leaves_file} does not exist.`)
        exit(-1);
    }
    let addresses = readFileSync(args.leaves_file).toString().split(",");
    let merkleTree = new MerkleTree(addresses, keccak256, { hashLeaves: true, sortPairs: true});
    let proof = merkleTree.getHexProof(keccak256(wallet.address));

    // Collect
    let contract = new Contract(args.contract_address, CollectorAbi, wallet);
    let graffiti = args.graffiti ? args.graffiti! : "";
    let recipient = args.recipient ? args.recipient! : wallet.address;
    let tx = await contract.collect(proof, graffiti, recipient);
    let result = await tx.wait();
    console.log(`Tx sent: ${result.transactionHash}`);
}

collect()
    .then(() => {})
    .catch(err => console.error(`Failed: ${err.reason}`))