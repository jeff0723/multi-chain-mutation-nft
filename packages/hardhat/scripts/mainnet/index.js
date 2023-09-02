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

async function execute(chains, wallet, options) {
  const args = options.args || [];
  const { source, destination, calculateBridgeFee } = options;
  console.log("options.args", options.args);
  console.log("source99", source);
  console.log("destination99", destination);
  console.log("calculateBridgeFee99", calculateBridgeFee);
  const message =
    args[2] ||
    `Hello ${destination.name} from ${
      source.name
    }, it is ${new Date().toLocaleTimeString()}.`;

  async function logValue() {
    console.log(
      `value at ${destination.name} is "${await destination.contract.value()}"`
    );
  }

  console.log("Starting...");
  // await logValue();

  const fee = await calculateBridgeFee(source, destination);

  await source.contract.registerHatchingContract(
    destination.name,
    destination.contract.address
  );

  const tx = await source.contract.mintNFT(
    wallet.address,
    ["tokenuri"],
    [destination.name],
    {
      value: fee,
    }
  );
  await tx.wait();

  console.log("tx", tx.hash);

  // const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // while ((await destination.contract.value()) !== message) {
  //   await sleep(1000);
  // }

  // console.log("--- After ---");
  // await logValue();
}

module.exports = {
  deploy,
  execute,
};
