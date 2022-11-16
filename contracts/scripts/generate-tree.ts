import { existsSync, readFileSync } from "fs";
import { exit } from "process";
import { parse } from "ts-command-line-args";
import { generateSaveTree } from "../utils/utils";

interface Args {
    in_file: string,
    out_file: string,
    num: number
}

let args = parse<Args>({
    in_file: String,
    out_file: String,
    num: Number
});

if (!existsSync(args.in_file)) {
    console.error("in_file does not exist");
    exit(-1);
}

let startingAddresses: string[] = readFileSync(args.in_file).toString().split(",");
generateSaveTree(startingAddresses, args.num, args.out_file);