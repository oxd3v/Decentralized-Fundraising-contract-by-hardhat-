//testing  the contract's properties 

//importing required library for testing the contract
const { SignerWithAddress } = require("@nomiclabs/hardhat-ethers/signers");
//importing assertion & expecttation method from chai library 
const { assert, expect } = require("chai");
//importing BigNumber object to handeling ether amount fomrmate 
const { BigNumber } = require("ethers");
//importing required stuff from hardhat to deploy smartContract
const { deployments, ethers, getNamedAccounts } = require("hardhat");
//importing another file and object to checking network id and name
const { developmentChain } = require("../helper-hardhat-config")
//testing for just localhost and hardhat network
!developmentChain.includes(network.name)
    ? describe.skip:
//mocha property to describe the test 
describe("fundMe", async function () {
    //deploy our fundme contract 
    //using hardhat-deploy
    //variable 
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1")
  //function what we need before calling every test
    beforeEach(async () => {
        // const accounts = await ethers.getSigners()
        // deployer = accounts[0]
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })
    // test the fundMe contract constructor 
    describe("constructor", async () => {
        it("sets the aggregator address correctly", async function () {
            const response = await fundMe.getPriceFeed()
            //assertion method of chai js library
            assert.equal(response, mockV3Aggregator.address)
        })
    })
    // testing the fund function of fundMe contract
    describe("fund", function () {
        // https://ethereum-waffle.readthedocs.io/en/latest/matchers.html
        // could also do assert.fail
        it("Fails if you don't send enough ETH", async () => {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })
        //update the amount by a deployer
        it("updated the amount in funders maping dataBase", async function () {
            await fundMe.fund({ value: sendValue })
            const result = await fundMe.getAddressToAmountFunded(deployer)
            //assertion method between maping returns with funded value
            assert.equal(result.toString(), sendValue.toString())
        })
        // get the deployer in funders array
        it("adds deployer to array of funders", async () => {
            await fundMe.fund({ value: sendValue })
            const result = await fundMe.getFunders(0)
            assert.equal(deployer, result)
        })
    })
    //describe with "cheapwithdraw" to specified the test of cheapWithdraw func of FundMe contract
    describe("cheapWithdraw", async () => {
        //specific beforeEach function for only withdraw test
        //withdraw test can't perform before funded the contract
        beforeEach(async () => {
            //funded the contract
            await fundMe.fund({ value: sendValue })
        })
        it("withdraw ETH from a single funder", async () => {
            //checking inital balances
            const initialFundMeBalance = await fundMe.provider.getBalance(fundMe.address)//contract balances
            // console.log(initialFundMeBalance.toString())
            const initialDeployerBalance = await fundMe.provider.getBalance(deployer) //signer balance
            // console.log(initialDeployerBalance.toString())
            //calling withdraw function
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
          //calculating gas cost in calling withdraw function /**console.log(`geting the object of ${transactionReceipt}) */ 
           const {gasUsed, effectiveGasPrice} = transactionReceipt
           const gasCost = gasUsed.mul(effectiveGasPrice)
            //final balances(checcking balances after calling withdraw function)
            const finalFundMeBalances = await fundMe.provider.getBalance(fundMe.address)
            // console.log(finalFundMeBalances.toString())
            const finalDeployerBalances = await fundMe.provider.getBalance(deployer)
            // console.log(finalDeployerBalances.toString())
            //asertion testing
            assert.equal(finalFundMeBalances, 0)//after withdraw contract will be null
            //signer will get all the contract balances will cost some gas prices to calling withdraw function
            assert.equal(initialFundMeBalance.add(initialDeployerBalance).toString(), finalDeployerBalances.add(gasCost).toString())
        })

        it("withdraw when funded by multiple funders", async ()=>{
            const accounts = await ethers.getSigners() // getting multiple account
            const balance = await ethers.provider.getBalance(fundMe.address)
            //variable 
            //creating a bigNumber instances
            // let sum = BigNumber.from("0");
            let sum = balance
            var connectedContract
            //looping through all the funders 
            for(let i=1; i< 6; i++){
                //connect the funder's accounts with FundMe contract which deployed  by deployer in describe "fundMe" beforeEach func
                 connectedContract = await fundMe.connect(accounts[i])
                //funded the contract by the funders
                await connectedContract.fund({value: sendValue})
                
                //fundMe contract balance
                const fundersBalances = await fundMe.getAddressToAmountFunded(accounts[i].address)
                sum = sum.add(fundersBalances)   
            }
        
            //checking inital balances
            const initialFundMeBalance = await connectedContract.provider.getBalance(connectedContract.address) //or
            // const initialFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const initialDeployerBalance = await fundMe.provider.getBalance(deployer)
            // withdraw
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            //calculating gas cost
           const {gasUsed, effectiveGasPrice} = transactionReceipt
           const gasCost = gasUsed.mul(effectiveGasPrice)
            //final balances
            const finalFundMeBalances = await fundMe.provider.getBalance(fundMe.address)      
            const finalDeployerBalances = await fundMe.provider.getBalance(deployer)
            //asertion testing
            assert.equal(sum.toString(), initialFundMeBalance.toString())
            assert.equal(finalFundMeBalances, 0)
            assert.equal(initialFundMeBalance.add(initialDeployerBalance).toString(), finalDeployerBalances.add(gasCost).toString())
            // funders array should be null after withdraw 
            //  expect(await fundMe.funders(0)).to.be.revertedWith("funders should zero")
            await expect(fundMe.getFunders(0)).to.be.reverted
             //every signers accounts shouid be 0
             //looping through all the funders
             for(let y=1; y<6;y++){
                assert.equal(await fundMe.getAddressToAmountFunded(accounts[y].address), 0)
             }
            })
            // it("only allows the owner to with", async ()=>{
            //     const accounts = await ethers.getSigner()
            //     const connectedContract = await fundMe.connect(accounts[1].address)
            //     await expect(connectedContract.cheapWithdraw()).to.be.reverted
            // })
            it("Only allows the owner to withdraw", async function () {
                const accounts = await ethers.getSigners()
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[1]
                )
                await expect(
                    fundMeConnectedContract.withdraw()
                ).to.be.reverted
            })
        })
})    
