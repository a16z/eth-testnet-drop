import { writeFileSync } from "fs";
import crypto from 'crypto';

export function generateSaveTree(
    addressesToInclude: string[] = [], 
    numLeafs: number ,
    outputFile: string): string[] {
    let result = "";
    let allAddresses = addressesToInclude;
    let i = 0;
    while (i < numLeafs) {
        if (i < addressesToInclude.length) {
            result += addressesToInclude[i];
        } else {
            let generatedAddress = crypto.randomBytes(32).toString('hex');
            result += generatedAddress;
            allAddresses.push(generatedAddress);
        }

        if (i != numLeafs - 1) {
            result += ","
        }

        i++;
    }
    writeFileSync(outputFile, result);

    return allAddresses;
}