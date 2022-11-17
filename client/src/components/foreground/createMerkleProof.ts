/* eslint-disable no-restricted-globals */
import MerkleTree from "merkletreejs";
import keccak256 from "keccak256";
import { Buffer } from "buffer";

// @ts-ignore for keccak256
self.Buffer = Buffer;

self.onmessage = ({ data: { address, leaves } }) => {
	let merkleTree = new MerkleTree(leaves, keccak256, {
		hashLeaves: true,
		sortPairs: true,
	});
	let leaf = keccak256(address);
	let proof = merkleTree.getHexProof(leaf);
	self.postMessage({
    resultProof: {
      proof: proof,
      leaf: `0x${leaf.toString("hex")}`,
      root: merkleTree.getHexRoot()
    }
  });
};

export {};
