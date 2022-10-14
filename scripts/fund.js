/**@notice it is simple intreracting the fundraising contract's funding properties */

const { ethers, getNamedAccounts } = require("hardhat");
//func to call fund proerties of Fundraising contract
async function main() {
  //variable
  const sendValue = ethers.utils.parseEther("0.1");
  //get deployer which sign the contract
  const { deployer } = await getNamedAccounts();
  //get the FundMe contract
  const fundMe = await ethers.getContract("FundMe", deployer);
  //lets interecting
  console.log(`-------welcome to simple Fundraising Contract------------`);
  console.log(`contract address at: ${fundMe.address}`);
  console.log(`funding contract............`);
  //funding the contract
  const transactionResponse = await fundMe.fund({ value: sendValue });
  //waiting for the block confirmation
  const transactionReceipt = await transactionResponse.wait(1);
  //calculating the gasCost of funding the contract
  const { gasUsed, effectiveGasPrice } = await transactionReceipt;
  const gasCost = gasUsed.mul(effectiveGasPrice);
  console.log(`funding succesfull with costing ${gasCost} amount of Gas`);
}
//invoked the main function
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
