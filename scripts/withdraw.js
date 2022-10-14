//interecting with withdraw behaivour of fundraising contract

//importing
const { ethers, getNamedAccounts, getUnnamedAccounts } = require("hardhat");

//calling withdraw function from the contract
const main = async () => {
  //deployer who sign the contract
  const { deployer } = await getUnnamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log(`---------welcome to fundraising contract----------`);
  console.log(
    `-----withdrawing from contract-----contract add:${fundMe.address}--`
  );
  const transactionResponse = await fundMe.cheapWithdraw();
  //waiting for the block confirmation
  const transactionReceipt = await transactionResponse.wait(1);
  //calculating the gasCost of funding the contract
  const { gasUsed, effectiveGasPrice } = await transactionReceipt;
  const gasCost = gasUsed.mul(effectiveGasPrice);
  console.log(`withdrawing succesfull with costing ${gasCost} amount of Gas`);
};
//invoking main function
main().catch((error) => {
  console.log(error.message);
  process.exitCode = 1;
});
