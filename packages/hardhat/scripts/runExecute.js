"use strict";
require("dotenv").config();
const {
  executeEVMExample,
  executeAptosExample,
  checkEnv,
  getExamplePath,
  getWallet,
  getEVMChains,
} = require("./libs");

const exampleName = process.argv[2];
const env = process.argv[3];
const args = process.argv.slice(4);

// Check the environment. If it is not valid, exit.
checkEnv(env);
console.log("env", env);

// Get the example object.
const example = require(getExamplePath(exampleName));

// Get the wallet.
const wallet = getWallet();

console.log("Executing");

let selectedChains = [];

if (args.length >= 2) {
  selectedChains = [args[0], args[1]];
}

const chains = getEVMChains(env, selectedChains);
console.log(chains);

executeEVMExample(env, chains, args, wallet, example);
