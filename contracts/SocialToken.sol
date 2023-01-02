//SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract SocialToken is ERC20, Ownable, ERC20Burnable {

    mapping(address => bool) controller;

    constructor() ERC20("Social Credits", "SOCIAL") {}

    function mint(address _to, uint256 _amount) external {
        require(controller[msg.sender] == true, "Not a controller");
        _mint(_to, _amount);
    }

    function setController(address _controller) external onlyOwner {
        controller[_controller] = true;
    }

    function removeController(address _controller) external onlyOwner {
        controller[_controller] = false;
    }
}
