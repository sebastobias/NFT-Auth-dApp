//SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./VipNFT.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "./SocialToken.sol";

contract UserStorage {

    struct userInfo {
        string firstName;
        string lastName;
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

    mapping(address => userInfo) public addressToUserInfo;
    mapping(uint256 => bool) public usedIdsMember;
    mapping(uint256 => bool) public usedIdsVip;
    mapping(address => bool) public profileCreated;

    event Claimed(address _to, uint256 _amount);
    event VipClaimed(address _to, uint256 _amount);

    function createProfile (
        string memory _firstName, 
        string memory _lastName, 
        string memory _username
    ) external {
        require(membershipType(msg.sender) <= 3, "You don't own any NFT");
        addressToUserInfo[msg.sender].firstName = _firstName;  
        addressToUserInfo[msg.sender].lastName = _lastName;  
        addressToUserInfo[msg.sender].username = _username;  
        profileCreated[msg.sender] = true;

        if(membershipType(msg.sender) == 1) {
            addressToUserInfo[msg.sender].timeStamp = uint48(block.timestamp);
        }
    }

    function updateInfo(uint256 _option, string memory _data) external {
        if (_option == 0) {
        addressToUserInfo[msg.sender].firstName = _data;
        }
        if (_option == 1) {
            addressToUserInfo[msg.sender].lastName = _data;
        }
        if (_option == 2) {
            addressToUserInfo[msg.sender].username = _data;
        }
    }

    function deleteMyUser() external {
        delete addressToUserInfo[msg.sender];
        profileCreated[msg.sender] = false;
    }

    function claimMember(uint256[] calldata tokenIds) external {
        _claimMember(msg.sender, tokenIds);
    }

    
    function claimVip(uint256[] calldata tokenIdsVip, uint256[] calldata tokenIdsMember) external {
        _claimVip(msg.sender, tokenIdsVip, tokenIdsMember);
    }

    function claimPeriodicReward(uint256[] calldata tokenIds) external {
        _claimPeriodicReward(msg.sender, tokenIds);
    }

    function _claimMember(address _address, uint256[] calldata tokenIds) internal {
        require(membershipType(_address) <= 2, "Not a Member");
        require(profileCreated[_address], "Not profile found");
        uint256 earned = 0;
        for (uint256 i = 0; i < tokenIds.length; i++) {
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

    function _claimVip(address _address, uint256[] calldata tokenIdsVip, uint256[] calldata tokenIdsMember) internal {
        require(membershipType(_address) == 1, "You don't have the rights to call this function");
        require(profileCreated[_address], "Not profile found");
        uint256 earned = 0;
        for (uint256 i = 0; i < tokenIdsVip.length; i++) {
            require(!usedIdsVip[tokenIdsVip[i]], "NFT/NFTs already used");
            usedIdsVip[tokenIdsVip[i]] = true;
        }
        earned += 75 ether * tokenIdsVip.length;
        if (earned > 0) {
            earned = earned / 10;
            socialToken.mint(_address, earned);
            emit VipClaimed(_address, earned);
            if (tokenIdsMember.length != 0) {
               _claimMember(_address, tokenIdsMember);
            }
        }
    }   

    function _claimPeriodicReward(address _address, uint256[] calldata tokenIds) internal {
        require(membershipType(_address) == 1, "You don't have the rights to call this function");
        uint256 earned = 0;

        uint48 createdAt = addressToUserInfo[_address].timeStamp;
        earned += 10 ether * tokenIds.length * (block.timestamp - createdAt) / 1 days;

        if (earned > 0) {
            earned = earned / 10;
            socialToken.mint(_address, earned);
            emit VipClaimed(_address, earned);
        }
        addressToUserInfo[_address].timeStamp = uint48(block.timestamp);
    }

    function periodicRewardInfo(address _address) external view returns (uint256) { 
        uint48 createdAt = addressToUserInfo[_address].timeStamp;
        require(membershipType(_address) == 1, "You have not the rights to perform this action");
        require(createdAt > 0, "No timestamp created");
        require(profileCreated[_address], "No profile created");
        uint256[] memory tokenIdsVip = vip.tokensOfOwner(_address);
        uint256 earned = 0;
        earned += 10 ether * tokenIdsVip.length * (block.timestamp - createdAt) / 1 days;
        return (earned / 10);
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

            if (memberNftsRewardClaimed) {
                return 0;
            }

            uint256[] memory tokenIds = member.tokensOfOwner(_address);

            earned += 50 ether * tokenIds.length;
            if (earned > 0) {
            return (earned / 10);
            }
        }

        if (membershipType(_address) == 1) {
            uint256[] memory tokenIdsVip = vip.tokensOfOwner(_address);

            for(uint256 i = 0; i < tokenIdsVip.length; i++) {
               if(usedIdsVip[tokenIdsVip[i]]) {
                   return 0;
               }
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
