pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";

contract HatchlingCCIP is ERC721, ERC721URIStorage, Ownable, CCIPReceiver {
    uint256 public tokenIdCounter;

    address _to;
    string _tokenUri;

    constructor(
        address router
    ) CCIPReceiver(router) ERC721("Hatchling", "HL") {}

    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override {
        (_to, _tokenUri) = abi.decode(message.data, (address, string));
        _safeMint(_to, tokenIdCounter);
        _setTokenURI(tokenIdCounter, _tokenUri);
        tokenIdCounter++;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}
