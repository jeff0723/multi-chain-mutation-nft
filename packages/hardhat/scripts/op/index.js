const {
  utils: { deployContract },
} = require("@axelar-network/axelar-local-dev");

const HatchlingABI = require("../../artifacts/contracts/Hatchling.sol/Hatchling.json");

async function deploy(chain, wallet) {
  console.log(`Deploying Hatchling`);
  chain.contract = await deployContract(wallet, HatchlingABI, [
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
