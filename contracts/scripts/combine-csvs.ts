// Parse files of format
// address
// <addr1>
// <addr2>
// ...
// And aggregate

import { readFileSync, writeFileSync } from "fs";

let IN_FILES = ["../queries/goerli_qualifying_addresses_all_Nov15.csv", "../queries/sepolia_qualifying_addresses_all_Nov15.csv"];
let OUT_FILE = "../queries/combined_qualifying_adddresses_Nov15.txt";

let uniqueAddrs = new Set<string>();
for (let inFile of IN_FILES) {
    let addresses = readFileSync(`${inFile}`).toString().split("\r\n");
    addresses.shift();
    addresses.forEach(addr => uniqueAddrs.add(addr.toLowerCase()));
    console.log(`${addresses.length} addresses for ${inFile}`);
}

// Test addrs
uniqueAddrs.add("0xDE66441e351c04a7A439517dd2F9f7E9C2B24137");
uniqueAddrs.add("0x5D5857779BC50cc3d25C9a533eEfA7BBea0e9b82");


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