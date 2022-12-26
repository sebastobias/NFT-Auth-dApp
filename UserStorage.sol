//SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./VipNFT.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "./SocialToken.sol";

contract UserStorage {

    struct userInfo {
        string firstName;
        string lastName;
        string email;
        string username;
        uint48 timeStamp;
    }

    VipNFT public vip;
    VipNFT public member;
    VipNFT public citizen;

    SocialToken public socialToken;

    constructor(
    address _vip,
    address _member,
    address _citizen,
    address _socialToken
    ) {
        vip = VipNFT(_vip);
        member = VipNFT(_member);
        citizen = VipNFT(_citizen);
        socialToken = SocialToken(_socialToken);
    }

    mapping(uint256 => mapping(address => userInfo)) public membership;
    mapping(uint256 => bool) usedIdsMember;
    mapping(uint256 => bool) usedIdsVip;
    mapping(address => bool) profileCreated;

    event Claimed(address _to, uint256 _amount);
    event VipClaimed(address _to, uint256 _amount);

    function createProfile (
        string memory _firstName, 
        string memory _lastName, 
        string memory _username
    ) external {
        require(membershipType(msg.sender) <= 3, "You don't own any NFT");
        uint256 memId = membershipType(msg.sender);
        membership[memId][msg.sender].firstName = _firstName;  
        membership[memId][msg.sender].lastName = _lastName;  
        membership[memId][msg.sender].username = _username;  
        profileCreated[msg.sender] = true;

        if(membershipType(msg.sender) == 1) {
            membership[memId][msg.sender].timeStamp = uint48(block.timestamp);
        }
    }

    function updateInfo(uint256 _option, string memory _data) external {
        uint256 memId = membershipType(msg.sender);
        if (_option == 0) {
        membership[memId][msg.sender].firstName = _data;
        }
        if (_option == 1) {
            membership[memId][msg.sender].lastName = _data;
        }
        if (_option == 2) {
            membership[memId][msg.sender].email = _data;
        }
        if(_option == 3) {
            membership[memId][msg.sender].username = _data;
        }
    }

    function deleteMyUser() external {
        uint256 memId = membershipType(msg.sender);
        delete membership[memId][msg.sender];
    }

    function claim() external {
        _claimReward(msg.sender);
    }

    function claimPeriodicReward(uint256[] calldata tokenIds) external {
        _claimPeriodicReward(msg.sender, tokenIds);
    }

    function _claimReward(address _address) internal {
        require(membershipType(_address) <= 2, "You don't have the rights to call this function");

        if (membershipType(_address) == 2 && profileCreated[_address]) {
            uint256[] memory tokenIds = member.tokensOfOwner(_address);
            uint256 earned = 0;
            for(uint256 i = 0; i < tokenIds.length; i++) {
                require(member.ownerOf(tokenIds[i]) == msg.sender, "Not an owner"); // test if this is neccesary
                require(!usedIdsMember[tokenIds[i]], "NFT/NFTs already used");
                usedIdsMember[tokenIds[i]] = true;
            }  
            earned += 50 ether * tokenIds.length;

            if (earned > 0) {
                earned = earned / 10;
                socialToken.mint(_address, earned);
                emit Claimed(_address, earned);
            }
        }

        if (membershipType(_address) == 1 && profileCreated[_address]) {
            uint256 earned = 0;
            uint256[] memory tokenIds = vip.tokensOfOwner(_address);
            uint256[] memory tokenIdsMember = member.tokensOfOwner(_address);
            bool memberNftsRewardClaimed = false;

            for(uint256 i = 0; i < tokenIds.length; i++) {
                require(vip.ownerOf(tokenIds[i]) == msg.sender, "Not an owner"); // test if this is neccesary
                require(!usedIdsVip[tokenIds[i]], "NFT/NFTs already used");
                usedIdsVip[tokenIds[i]] = true;
            }  
            earned += 70 ether * tokenIds.length;

            for(uint256 i = 0; i < tokenIdsMember.length; i++) {
                memberNftsRewardClaimed = usedIdsMember[tokenIdsMember[i]];
            }  

            if(!memberNftsRewardClaimed) {
                earned += 50 ether * member.balanceOf(_address);
            }

            if (earned > 0) {
                earned = earned / 10;
                socialToken.mint(_address, earned);
                emit Claimed(_address, earned);
            }
        }

    }

    function _claimPeriodicReward(address _address, uint256[] calldata tokenIds) internal {
        require(membershipType(_address) == 1, "You don't have the rights to call this function");
        uint256 earned = 0;

        for(uint256 i = 0; i < tokenIds.length; i++) {
            require(vip.ownerOf(tokenIds[i]) == msg.sender, "Not an owner"); //test if this is neccesary
        }

        uint48 createdAt = membership[membershipType(_address)][_address].timeStamp;
        earned += 10 ether * tokenIds.length * (block.timestamp - createdAt) / 1 days;

        if (earned > 0) {
            earned = earned / 10;
            socialToken.mint(_address, earned);
            emit VipClaimed(_address, earned);
        }
    }

    function periodicRewardInfo(address _address, uint256[] calldata tokenIds) external view returns (uint256) { 
        require(membershipType(_address) == 1, "You have not the rights to perform this action");
        uint48 createdAt = membership[membershipType(_address)][_address].timeStamp;
        uint256 earned = 0;
        earned += 10 ether * tokenIds.length * (block.timestamp - createdAt) / 1 days;
        return earned;
    }

    function rewardInfo(address _address) external view returns (uint256) {
        require(profileCreated[_address], "Profile Not Created");
        uint256 earned = 0;
        uint256[] memory tokenIdsMember = member.tokensOfOwner(_address);
        bool memberNftsRewardClaimed = false;
        
        if (membershipType(_address) == 2) {
            for(uint256 i = 0; i < tokenIdsMember.length; i++) {
                memberNftsRewardClaimed = usedIdsMember[tokenIdsMember[i]];
            }  
            require(!memberNftsRewardClaimed, "Rewards already claimed");

            uint256[] memory tokenIds = member.tokensOfOwner(_address);

            earned += 50 ether * tokenIds.length;
            if (earned > 0) {
            return (earned / 10);
            }
        }

        if (membershipType(_address) == 1) {
            uint256[] memory tokenIdsVip = vip.tokensOfOwner(_address);

            for(uint256 i = 0; i < tokenIdsVip.length; i++) {
                require(vip.ownerOf(tokenIdsVip[i]) == msg.sender, "Not an owner"); // test if this is necesary
                require(!usedIdsVip[tokenIdsVip[i]], "NFT/NFTs already used");
            }  

            earned += 75 ether * tokenIdsVip.length;

            for(uint256 i = 0; i < tokenIdsMember.length; i++) {
                memberNftsRewardClaimed = usedIdsMember[tokenIdsMember[i]];
            }  

            if(!memberNftsRewardClaimed) {
                earned += 50 ether * member.balanceOf(_address);
            }

            if (earned > 0) {
                return (earned / 10);
            }
        }
        return earned;
    }

    function membershipType(address _address) public view returns (uint256) {
        if (vip.balanceOf(_address) >= 1) {
            return 1;
        }
        if (member.balanceOf(_address) >= 1) {
            return 2;
        }
        if (citizen.balanceOf(_address) >= 1) {
            return 3;
        }
        if (vip.balanceOf(_address) == 0 || member.balanceOf(_address) == 0 || citizen.balanceOf(_address) == 0) {
            return 4;
        }
    }

}