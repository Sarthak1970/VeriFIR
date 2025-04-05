module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: "https://mainnet.infura.io/v3/5fbd25891905492eb230a91f3c085674",
      accounts: ["3cddcca4ce94f671e58c63584e7584e4b17864cb4d978fca1fcfd3c8bcc85714"]
    }
  }
};