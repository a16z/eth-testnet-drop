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

export function chunkItems<T>(items: T[], size: number): T[][] {
  return items.reduce((chunks: T[][], item: T, index) => {
    const chunk = Math.floor(index / size);
    chunks[chunk] = ([] as T[]).concat(chunks[chunk] || [], item);
    return chunks;
    }, []);
}

export function diffSetsSorted(superset: string[], subset: string[]): string[] {
    if (subset.length == 0) return superset;

    let result: string[]  = [];
    let subI = 0;
    let superI = 0;
    while (superI < superset.length) {
        let superItem = superset[superI];
        let subItem = subset[Math.min(subI, subset.length - 1)];

        if (superItem.toLowerCase() === subItem.toLowerCase()) {
            superI++;
            subI++;
        } else {
            result.push(superItem);
            superI++;
        }
    }

    return result;
}