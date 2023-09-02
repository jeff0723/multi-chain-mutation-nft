# Dinosaur

```shell
npm run setup
npm run start # start the local hardhat node

# deploy contracts (remember to get faucet token)
npm run deploy scripts/mainnet testnet --srcChain Ethereum # deploy to goerli
npm run deploy scripts/op testnet --srcChain optimism
npm run deploy scripts/linea testnet --srcChain linea

# verify
npx hardhat verify 0xb4805bc3cf2835498c410656176878b96eaadda8 0xe432150cce91c13a887f7D836923d5597adD8E31 0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6 --network goerli
```

## Contract Addresses

- GateWay: 0xe432150cce91c13a887f7D836923d5597adD8E31
- Gas service: 0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6
- Goerli: 0xb4805Bc3cF2835498C410656176878b96eaAdDA8

### Parameters

- `srcChain`: The blockchain network from which the message will be relayed. Acceptable values include "Moonbeam", "Avalanche", "Fantom", "Ethereum", and "Polygon". Default value is Avalanche.
- `destChain`: The blockchain network to which the message will be relayed. Acceptable values include "Moonbeam", "Avalanche", "Fantom", "Ethereum", and "Polygon". Default value is Fantom.
- `message`: The message to be relayed between the chains. Default value is "Hello World".
