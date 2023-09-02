pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721URIStorage } from '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import { AxelarExecutable } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol';
import { IAxelarGateway } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol';
import { IAxelarGasService } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol';

contract Hatchling is ERC721, ERC721URIStorage, AxelarExecutable, Ownable {

    uint256 public tokenIdCounter;
    IAxelarGasService public immutable gasService;

    address _to;
    string _tokenUri;

    constructor(address gateway_, address gasReceiver) AxelarExecutable(gateway_) ERC721("Hatchling", "HL") {
      gasService = IAxelarGasService(gasReceiver);
    }

    function _execute(string calldata sourceChain_, string calldata sourceAddress_, bytes calldata payload_) internal override {
      (_to, _tokenUri) = abi.decode(payload_, (address, string));
      _safeMint(_to, tokenIdCounter);
      _setTokenURI(tokenIdCounter, _tokenUri);
      tokenIdCounter++;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

  function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }
}