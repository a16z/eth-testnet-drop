import { ethers, providers } from "ethers";
import { GcpKmsSigner } from "ethers-gcp-kms-signer";
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "fs";
import { exit } from "process";
import { parse } from "ts-command-line-args";
import NetworkConfig from "../../network-config";
import getKmsCredentials from "../../utils/kms";
import { Duster, Duster__factory } from "../../typechain-types";
import { chunkItems, diffSetsSorted } from "../../utils/utils";
import { createLogger, transports, format } from "winston";
import { resourceLimits } from "worker_threads";

interface Args {
    network: string,
    duster_addr: string,
    all_address_file: string,
    persist_sent_address_file: string,
    persist_failed_address_file: string,
    chunk_size: number,
}
const args = parse<Args>({
    network: String,
    duster_addr: String,
    all_address_file: String,
    persist_sent_address_file: String,
    persist_failed_address_file: String,
    chunk_size: Number,
});

let logger = createLogger({
    transports: [
        new transports.Console,
        new transports.File({
            dirname: "logs",
            filename: `duster_${args.network}.log`
        }),
    ],
    format: format.combine(
        format.timestamp(),
        format.splat(),
        format.printf(({timestamp, level, message}) => {
            return `[${timestamp}] ${level}: ${message}`
        })
    )
})


let AMOUNT = ethers.utils.parseEther("0.01");

async function main() {
    let rpcUrl = NetworkConfig.getRpc(args.network);
    if (rpcUrl === undefined) {
        logger.error(`Could not find config for ${args.network}`);
        exit(-1);
    }
    if (!existsSync(args.all_address_file)) {
        logger.error(`${args.all_address_file} does not exst.`);
        exit(-1);
    }

    let provider = new providers.JsonRpcProvider(rpcUrl!);
    let kmsCredentials = getKmsCredentials();
    let signer = new GcpKmsSigner(kmsCredentials);
    signer = signer.connect(provider);
    logger.info(`Connected to gcloud KMS with address: ${await signer.getAddress()} for network ${rpcUrl!}`);
    let preBalance = await signer.getBalance();
    logger.info(`${await signer.getAddress()} balance: ${preBalance.toString()}`)


    logger.info(`Loading and diffing addresses between ${args.all_address_file} and ${args.persist_sent_address_file}`)
    let allAddresses: string[] = readFileSync(args.all_address_file).toString().split(",").sort();
    let preSentAddresses: string[] = existsSync(args.persist_sent_address_file) ? readFileSync(args.persist_sent_address_file).toString().split(",") : [];
    let addressesToSend: string[] = diffSetsSorted(allAddresses, preSentAddresses);

    logger.info(`Superset addresses: ${allAddresses.length} | Already complete: ${preSentAddresses.length} | To be sent: ${addressesToSend.length}`);

    let duster: Duster = new Duster__factory(signer).attach(args.duster_addr);

    let addressChunks: string[][] = chunkItems(addressesToSend, args.chunk_size);

    logger.info(`Starting ${addressChunks.length} chunks of ${args.chunk_size} addresses.`)
    let chunkNum = 0;
    for (let addressChunk of addressChunks) {
        persist(args.persist_sent_address_file, addressChunk);

        // TODO: Manual gas pricing
        try {
            let tx = await duster.dust(addressChunk, AMOUNT, { value: AMOUNT.mul(args.chunk_size) });
            logger.info(`[sent] ${tx.hash} | start_addr: ${addressChunk[0]} | end_addr ${addressChunk[addressChunk.length - 1]}`)
            logger.info(`[gas_info] gas_price ${tx.gasPrice} | gas_limit ${tx.gasLimit} | max_fee_per_gas ${tx.maxFeePerGas} | max_priority_fee_per_gas ${tx.maxPriorityFeePerGas}`)

            let rec = await tx.wait();
            logger.info(`${tx.hash} included in ${rec.blockNumber} | ${rec.blockHash}`)
        } catch (err) {
            logger.error("FAILED %s", err);
            persist(args.persist_failed_address_file, addressChunk);
            exit(-1); // TODO: Remove
        }

        chunkNum++;
        logger.info(`Chunk ${chunkNum} / ${addressChunks.length} complete.`)
    }
}

function persist(completeFilePath: string, newAddrs: string[]) {
    let appendString = newAddrs.join() + ","
    if (!existsSync(completeFilePath)) {
        writeFileSync(completeFilePath, appendString);
    } else {
        appendFileSync(completeFilePath, appendString);
    }
}

function diffSets(superset: string[], subset: string[]): string[] {
    let result: string[] = [];
    for (let item of superset) { // TODO: terribly slow
        if (subset.findIndex((sub) => sub.toLowerCase() === item.toLowerCase()) === -1) { 
            result.push(item);
        }
    }
    return result;
}



main()
    .then(() => logger.info("Complete."))
    .catch(err => logger.error("System wide failure: %s", err))