/* eslint-disable no-restricted-globals */
import MerkleTree from "merkletreejs";
import keccak256 from "keccak256";
import { Buffer } from "buffer";
import { utils } from "ethers";

// @ts-ignore for keccak256
globalThis.Buffer = Buffer;
self.Buffer = Buffer;

// merkleProof as a webworker such that it can be threaded
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
