# Dinosaur

```shell
npm run setup
npm run start # start the local hardhat node

# deploy contracts (remember to get faucet token)
npm run deploy scripts/mainnet testnet --srcChain Avalanche

npm run deploy scripts/mainnet testnet --srcChain Ethereum # deploy to goerli
npm run deploy scripts/op testnet --srcChain optimism
npm run deploy scripts/linea testnet --srcChain linea
npm run deploy scripts/polygon testnet --srcChain polygon

npm run execute scripts/mainnet testnet --srcChain Ethereum --destChain optimism

# verify
npx hardhat verify 0xb4805bc3cf2835498c410656176878b96eaadda8 0xe432150cce91c13a887f7D836923d5597adD8E31 0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6 --network goerli
```

## Contract Addresses

- GateWay: 0xe432150cce91c13a887f7D836923d5597adD8E31
- Gas service: 0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6
- Goerli: 0xb4805Bc3cF2835498C410656176878b96eaAdDA8
- Linea: 0x407d0108fB330c17E7039B7BCfFb0910b585dEc8
- Polygon: 0xb4805Bc3cF2835498C410656176878b96eaAdDA8
- Optimism: 0xb4805Bc3cF2835498C410656176878b96eaAdDA8
- Optimism Georli (Chainlink CCIP):0xd5ef3698f188a95411ed5d38909549627e04e96c
- ETH Seploia (Chainlink CCIP): 0x5fba5ae72bd0e0df6bc6951e5a5666724be2870c30c836547a2daf0eeca30bd9

### Parameters

- `srcChain`: The blockchain network from which the message will be relayed. Acceptable values include "Moonbeam", "Avalanche", "Fantom", "Ethereum", and "Polygon". Default value is Avalanche.
- `destChain`: The blockchain network to which the message will be relayed. Acceptable values include "Moonbeam", "Avalanche", "Fantom", "Ethereum", and "Polygon". Default value is Fantom.
- `message`: The message to be relayed between the chains. Default value is "Hello World".
