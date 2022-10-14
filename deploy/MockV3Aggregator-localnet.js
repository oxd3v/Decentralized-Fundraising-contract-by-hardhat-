/**@notice this contract deployed for testing on localnet because localnet doesnt has any chainlink priceFeedAddress */

//importing.....
const {network} = require("hardhat")
const { developmentChain } = require("../helper-hardhat-config")

//variable for constructor
  //for deploying MockV3Aggregator.sol contract's constructor requirements
   const DECIMALS = "8"
   const INITIAL_PRICE = "200000000000"

//contract deployment by hardhat-deploy async function and exporing it as defalut
module.exports = async ({getNamedAccounts, deployments})=>{
         const {deploy , log} = deployments
         const {deployer} = await getNamedAccounts()
         const chainId = network.config.chainId

         //this contract deployed only for localhost or hardhat network
      if(developmentChain.includes(network.name)){
        log("local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract:"MockV3Aggregator", 
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],          
        })
        log("Mocks Deployed!")
        log("------------------------------------------")
        log(
            "You are deploying to a local network, you'll need a local network running to interact"
        )
        log(
            "Please run `npx hardhat console` to interact with the deployed smart contracts!"
        )
        log("------------------------------------------------")
      }   
}
module.exports.tags = ["all", "mocks"]