const { ethers } = require("hardhat");

async function main() {
  const FIRStorage = await ethers.getContractFactory("FIRStorage");
  const firStorage = await FIRStorage.deploy();
  await firStorage.deployed();
  console.log("FIRStorage deployed to:", firStorage.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });