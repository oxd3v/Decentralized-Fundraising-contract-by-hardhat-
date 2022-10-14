/**@notice deploying fundraising contract(fundMe.sol) with hardhat-deploy */

//importing required stuff.....
const { networkConfig, developmentChain } = require("../helper-hardhat-config");
//dotenv for using enviroment variable
require("dotenv").config();
const { verify } = require("../utility tool/verify");

//deploying async func and exporting it as default
module.exports = async ({ getNamedAccounts, deployments, network }) => {
  //take a look in deployments object
  // console.log(deployments)
  //take a look in network object when deployed in different network
  console.log(network);
  //collecting deploy and log properties from deployments obj
  const { deploy, log } = deployments;
  //get the signer address or choosen address
  const { deployer } = await getNamedAccounts();
  //get the chainId from network obj
  const chainId = network.config.chainId;

  // IF THE CONTRACT DOESNT EXIST ANY ADDRESS OF PRICE FEED . WE USE MINIMAL VERSION  FOR LOCAL TESTING
  let pricefeedaddress;
  //if deployed in localhost or hardhat then we will using mockAddress as pricefeedaddress
  if (developmentChain.includes(network.name)) {
    log("local network detected on fundme.sol contract deployment.....");
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    log(ethUsdAggregator.address);
    pricefeedaddress = ethUsdAggregator.address;
  } else {
    //when we change network to deploy we can use different priceFeed address for specific netowrk chainId
    pricefeedaddress = networkConfig[chainId].ethUsdPriceFeed;
  }
  log(deployer);
  const arguments = [pricefeedaddress];
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [
      pricefeedaddress,
      //if chain Id X use address Y
    ],
    log: true,
    waitConfirmations: network.config.blockConfirmations,
  });
  //if its not a hardhat network
  if (
    !developmentChain.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("testnet or mainnet detected..... ");
    log("verifying on testnet..... ");
    log(`contract address: ${fundMe.address}`);
    await verify(fundMe.address, arguments);
  }
};

module.exports.tags = ["all", "fundme"];
