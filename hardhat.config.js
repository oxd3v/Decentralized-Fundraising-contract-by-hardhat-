/**@NOTICE hardhat configeration file */

//importing required stuff from package.json
require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy")
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */
//enviroment variable
const key = process.env.PRIVATE_KEY
const url = process.env.JSON_URL

//configuration stuff......(module scafolding)
module.exports = {
  defaultNetwork: "hardhat",
  networks:{
       goerli:{
        url: url,
        chainId:5,
        accounts:[key],
        blockConfirmations : 6
       }
  },
  solidity: {
    compilers:
      [{
        version:"0.8.17"
      },
      {
        version: "0.6.6"
      },
      {
        version: "0.8.8"
      },
    ]
    //configuration for getNamedAccount.....
  },
   namedAccounts:{
    deployer:{
      default: 0
    },
    user:{
      default: 1
    }
   },
   //configuration for contract verification by etherscan
   etherscan:{
     apiKey: process.env.ETHERSCAN_API_KEY,
   },
   //configuration for gas-report analysing 
   gasReporter: {
       enabled: true,
       currency: "USD",
       outputFile: "gas-report.txt",
       noColors: true,
       //using coinmarketcap API
       coinmarketcap: process.env.COINMARKET_API
   }
};
