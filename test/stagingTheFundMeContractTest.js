/**@notice staging test for goerli testnet  */

//importing required library or properties
const { assert } = require("chai");
const { network, ethers, getNamedAccounts } = require("hardhat");
const { developmentChain } = require("../helper-hardhat-config");
//checking the network is testnet or not?
developmentChain.includes(network.name)
  ? describe.skip
  : describe("FundMe Staging Tests", function() {
      //set mocha framwork timeout 1sec to 5sec delay to timeout error
      this.timeout(50000);
      //variable
      let deployer;
      let fundMe;
      const sendValue = ethers.utils.parseEther("0.1");
      //hook for task which should complete before starting task
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
      });

      it("allows people to fund and withdraw", async function() {
        //funded the contract
        const fundTxResponse = await fundMe.fund({ value: sendValue });
        //wait for blockConfirmation
        await fundTxResponse.wait(1);
        //withdraw from contract
        const withdrawTxResponse = await fundMe.withdraw();
        //waiting for block confirmation or transaction reciept
        await withdrawTxResponse.wait(1);
        // contract's balance after withdraw
        const endingFundMeBalance = await fundMe.provider.getBalance(
          fundMe.address
        );
        console.log(
          endingFundMeBalance.toString() +
            " should equal 0, running assert equal..."
        );
        //asserting test
        assert.equal(endingFundMeBalance.toString(), "0");
        /**@notice do test if needed although we tested in localhost and hardhat network in fundMe-unit-test.js file */
      });
    });
