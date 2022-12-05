import { readFileSync, writeFileSync } from "fs";

let IN_FILE = "../queries/sepolia_qualifying_needs_airdrop_Nov15.csv";
let OUT_FILE = "../queries/sepolia_needs_airdrop.txt";

// let IN_FILE = "../queries/goerli_qualifying_needs_airdrop_Nov15.csv";
// let OUT_FILE = "../queries/goerli_needs_airdrop.txt";

let addresses = readFileSync(IN_FILE).toString().split("\r\n");
addresses.shift();
console.log(`${addresses.length} addresses for ${IN_FILE}`);
writeFileSync(OUT_FILE, addresses.join());