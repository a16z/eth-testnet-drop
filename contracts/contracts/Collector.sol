// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.16;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Collector {
    bytes32 public root;
    mapping(address => bool) public claimed;

    constructor(bytes32 _root) {
        root = _root;
    }

    function collect(
        bytes32[] memory proof,
        bytes32 leaf,
        string memory graffiti
    ) public returns (bool) { 
        require(MerkleProof.verify(proof, root, leaf), "Failed merkle proof");
        require(claimed[msg.sender] == false, "Already claimed");
        claimed[msg.sender] = true;
        return true;
    }
}