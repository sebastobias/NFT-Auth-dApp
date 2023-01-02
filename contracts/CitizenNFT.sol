// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CitizenNFT is ERC721Enumerable, Ownable {

    uint256 public maxSupply = 1000;
    uint256 public maxMint = 15;
    string public baseUri;
    string public baseExtension = '.json';
    bool public paused = false;

    constructor() ERC721("Citizen NFT", "CITIZENNFT") { }

    function mint(address _to, uint256 _amount) public {
        uint256 supply = totalSupply();
        require(supply + _amount <= maxSupply);
        require(!paused);
        require(_amount > 0);
        require(_amount < maxMint);

        for(uint256 i = 1; i <= _amount ; i++) {
            _safeMint(_to, supply + i);
        }
    }

    function pause(bool _paused) public onlyOwner {
        paused = _paused;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return "https://raw.githubusercontent.com/wenlambotoken/NFTSWenLambo/main/json/";
    }

    function tokensOfOwner(address _address) public view returns (uint256[] memory) {
        uint256 ownerCounts = balanceOf(_address);
        uint256[] memory tokenIds = new uint256[](ownerCounts);
        for(uint256 i = 0; i < tokenIds.length; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_address, i);
        }
        return tokenIds;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: Token doesn't exists");
        string memory currentBaseUri = _baseURI();
        bytes memory tokenIdBytes = abi.encode(tokenId);
        string memory tokenIdString = string(tokenIdBytes);
        return
        bytes(baseUri).length > 0 ?
        string(abi.encodePacked(currentBaseUri, tokenIdString, baseExtension)) 
        : "";
    }

    function setmaxMintAmount(uint256 _newmaxMintAmount) public onlyOwner() {
        maxMint = _newmaxMintAmount;
    }
    
    function setBaseURI(string memory _newBaseURI) public onlyOwner() {
        baseUri = _newBaseURI;
    }
    
    function setBaseExtension(string memory _newBaseExtension) public onlyOwner() {
        baseExtension = _newBaseExtension;
    }
    
    function withdraw() public payable onlyOwner() {
        require(address(this).balance > 0, "Contract has no balance to withdraw");
        require(payable(msg.sender).send(address(this).balance), "Transfer failed");
    }



} 

