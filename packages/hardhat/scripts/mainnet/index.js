const {
  utils: { deployContract },
} = require("@axelar-network/axelar-local-dev");

const DinosaurABI = require("../../artifacts/contracts/Dinosaur.sol/Dinosaur.json");
const HatchlingABI = require("../../artifacts/contracts/Hatchling.sol/Hatchling.json");

async function deploy(chain, wallet) {
  console.log(`Deploying Dinosaur`);
  chain.contract = await deployContract(wallet, DinosaurABI, [
    chain.gateway,
    chain.gasService,
  ]);
  chain.wallet = wallet;
  console.log(
    `Deployed Dinosaur for ${chain.name} at ${chain.contract.address}.`
  );
}

module.exports = {
  deploy,
  // execute,
};
