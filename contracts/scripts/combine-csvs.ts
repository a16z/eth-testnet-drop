// Parse files of format
// address
// <addr1>
// <addr2>
// ...
// And aggregate

import { readFileSync, writeFileSync } from "fs";

let IN_FILES = ["../queries/goerli_qualifying_addresses_all_Nov15.csv", "../queries/sepolia_qualifying_addresses_all_Nov15.csv"];
let OUT_FILE = "../queries/combined_qualifying_addresses_Nov15.txt";

let uniqueAddrs = new Set<string>();
for (let inFile of IN_FILES) {
    let addresses = readFileSync(`${inFile}`).toString().split("\r\n");
    addresses.shift();
    addresses.forEach(addr => uniqueAddrs.add(addr.toLowerCase()));
    console.log(`${addresses.length} addresses for ${inFile}`);
}

let outStr = ""
Array.from(uniqueAddrs).sort().forEach((address, index) => {
    if (index == uniqueAddrs.size - 1) {
        outStr += address;
    } else {
        outStr += (address + ",")
    }

})
writeFileSync(OUT_FILE, outStr);
console.log(`Wrote ${uniqueAddrs.size} to ${OUT_FILE}.`)