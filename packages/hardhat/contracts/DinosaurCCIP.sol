pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";

contract DinosaurCCIP is ERC721, ERC721URIStorage, Ownable {
    enum PayFeesIn {
        Native,
        LINK
    }

    address immutable i_router;
    address immutable i_link;

    uint256 public tokenIdCounter;
    mapping(string => string) public hatchingContracts;
    event MessageSent(bytes32 messageId);

    constructor(address router, address link) ERC721("Dinosaur", "DS") {
        i_router = router;
        i_link = link;
        LinkTokenInterface(i_link).approve(i_router, type(uint256).max);
    }

    receive() external payable {}

    // need to specify value to pay for other chian's gas
    function mintNFT(
        address _to,
        string[] memory _tokenUris,
        uint64[] memory destinationChainSelectors,
        address[] memory hatchingContracts,
        PayFeesIn payFeesIn
    ) external payable {
        require(msg.value > 0, "Gas payment is required");

        _safeMint(_to, tokenIdCounter);
        _setTokenURI(tokenIdCounter, _tokenUris[0]);
        tokenIdCounter++;

        // mint nft on other chain
        for (uint256 i = 1; i < _tokenUris.length; i++) {
            bytes memory payload = abi.encode(_to, _tokenUris[i]);
            uint64 destinationChainSelector = destinationChainSelectors[i - 1];
            address hatchingContract = hatchingContracts[i - 1];
            Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
                receiver: abi.encode(hatchingContract),
                data: abi.encodeWithSignature(string(payload), msg.sender),
                tokenAmounts: new Client.EVMTokenAmount[](0),
                extraArgs: "",
                feeToken: payFeesIn == PayFeesIn.LINK ? i_link : address(0)
            });

            uint256 fee = IRouterClient(i_router).getFee(
                destinationChainSelector,
                message
            );

            bytes32 messageId;

            if (payFeesIn == PayFeesIn.LINK) {
                // LinkTokenInterface(i_link).approve(i_router, fee);
                messageId = IRouterClient(i_router).ccipSend(
                    destinationChainSelector,
                    message
                );
            } else {
                messageId = IRouterClient(i_router).ccipSend{value: fee}(
                    destinationChainSelector,
                    message
                );
            }
            emit MessageSent(messageId);
        }
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
