const { ethers } = require("ethers");

const abi = require("../artifacts/contracts/Dinosaur.sol/Dinosaur.json").abi;
async function main() {
  const signer = ethers.getDefaultProvider("");
  console.log("signer", signer);

  const contract = new ethers.Contract(
    "0xb4805bc3cf2835498c410656176878b96eaadda8",
    abi,
    signer
  );
  const tx = await contract.registerHatchingContract(
    "linea",
    "0x407d0108fB330c17E7039B7BCfFb0910b585dEc8"
  );
  await tx.wait();
  console.log("tx", tx);

  // contract addr: 0xb4805bc3cf2835498c410656176878b96eaadda8
  // function name: mintNFT
  // param1: 0xf47b316aa3f0d6ec955d986aa6c44ba186e26762
  // param2: ["tokenuri1", "tokenuri2", "tokenuri3", "tokenuri4"]
  // param3: [10000000000000000, 10000000000000000, 10000000000000000]
  // param4: ["optimism", "polygon", "linea"]
  // msg.value: 40000000000000000
}

main();
