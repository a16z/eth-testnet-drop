// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.16;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Duster is Ownable {
    constructor() {}

    function dust(
        address[] calldata addresses,
        uint amount
    ) public onlyOwner payable {
        for (uint i = 0; i < addresses.length; i++) {
            payable(address(addresses[i])).transfer(amount);
        }
    }

    function pull(uint amount) public onlyOwner {
        payable(address(msg.sender)).transfer(amount);
    }

    receive() external payable {}
}