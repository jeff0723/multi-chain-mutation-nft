pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721URIStorage } from '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import { AxelarExecutable } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/executable/AxelarExecutable.sol';
import { IAxelarGateway } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol';
import { IAxelarGasService } from '@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol';

contract Dinosaur is ERC721, ERC721URIStorage, AxelarExecutable, Ownable  {
    uint256 public tokenIdCounter;
    IAxelarGasService public immutable gasService;

    mapping(string => string) public hatchingContracts;

    constructor(address gateway_, address gasReceiver) AxelarExecutable(gateway_) ERC721 ("Dinosaur", "DS") {
      gasService = IAxelarGasService(gasReceiver);
    }

    function registerHatchingContract(string memory chainName, string memory hatchingContractAddr) external onlyOwner {
      hatchingContracts[chainName] = hatchingContractAddr;
    }

    // need to specify value to pay for other chian's gas
    function mintNFT(address _to, string[] memory _tokenUris, uint256[] memory _gasFees, string[] memory _destinations) external payable {
      require(msg.value > 0, 'Gas payment is required');

      _safeMint(_to, tokenIdCounter);
      _setTokenURI(tokenIdCounter, _tokenUris[0]);
      tokenIdCounter++;

      // mint nft on other chain
      for(uint256 i=1; i<_tokenUris.length; i++) {
        bytes memory payload = abi.encode(_to, _tokenUris[i]);
        gasService.payNativeGasForContractCall{ value: _gasFees[i-1] }(
            address(this),
            _destinations[i-1],
            hatchingContracts[_destinations[i-1]],
            payload,
            msg.sender
        );
        gateway.callContract(_destinations[i-1], hatchingContracts[_destinations[i-1]], payload);
      }
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