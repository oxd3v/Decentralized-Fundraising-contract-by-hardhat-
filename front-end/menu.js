//its not completed yet. its has lots more stuff to change and organise in future

//importing staff........
// import { BigNumber } from "@nomiclabs/hardhat-ethers";
import { ethers } from "../ether web library/ether-library.js";
import {
  abi,
  contractAddress,
  deployerAddress,
} from "../contract-Information.js";
// var fundersSome = BigNumber.from("0");
var fundersSome = 0;
//checking network
if (typeof window.ethereum !== "undefined") {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const { name, chainId } = await provider.getNetwork();
  if (name) {
    const updateMessage = `you'r connected to ${name} network`;
    document.getElementById("metamaskM").innerHTML = updateMessage;
  } else {
    document.getElementById("metamaskM").innerHTML = "connect your wallet!";
  }
} else {
  document.getElementById("metamaskM").innerHTML = "connect your wallet!";
}

//interacting with button tag
const connectButton = document.getElementById("metamask");
const withdrawButton = document.getElementById("withdrawButton");
const fundButton = document.getElementById("fundButton");
const balanceDiv = document.getElementById("balanceId");

//declaring action and invoked the func...
balanceDiv.onclick = getBalance;
const fundersDiv = document.getElementById("fundersId");
fundersDiv.onclick = totalfunding;
connectButton.onclick = connect;
withdrawButton.onclick = withdraw;
fundButton.onclick = fund;

//creating func............
async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.log(error.message);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const network = await ethers.getDefaultProvider().getNetwork();
    // console.log(network);
    const { chainId, name } = await provider.getNetwork();
    const networkI = await provider.getNetwork();
    console.log(networkI);

    const updatedMessage = `connected to ${name} network at account: ${accounts[0]} `;
    document.getElementById("metamaskM").innerHTML = updatedMessage;
  } else {
    document.getElementById("metamaskM").innerHTML = "Please install MetaMask";
  }
}

//its not complete yet it is under construction.....
async function totalfunding() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      console.log(fundersSome);
      document.getElementById("fundersId").innerHTML = fundersSome;
    } catch (error) {
      console.log(error.message);
    }
  }
}

// withdraw func with dynamic error managment
async function withdraw() {
  console.log(`Withdrawing...`);
  console.log(window.navigator.onLine);
  if (window.navigator.onLine) {
    console.log(window.navigator.onLine);
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const transactionResponse = await contract.cheapWithdraw();
        await listenForTransactionMine(transactionResponse, provider);
        //simply u can also use it too
        // await transactionResponse.wait(1)
      } catch (error) {
        const errorMessage = JSON.stringify(error);
        const errorObject = JSON.parse(errorMessage);
        const maliciousAddress = errorObject.transaction.from;

        if (deployerAddress !== maliciousAddress) {
          document.getElementById("withdrawButton").innerHTML =
            "you are not the owner";
          document.getElementById("withdrawButton").style.backgroundColor =
            "red";

          console.log(maliciousAddress);
          console.log(deployerAddress);
        }
        document.getElementById("withdrawButton").innerHTML =
          "withdraw Failed!";
      }
    } else {
      withdrawButton.innerHTML = "Please install MetaMask";
    }
  } else {
    document.getElementById("metamaskM").innerHTML = "you are in offline";
    document.getElementById("withdrawButton").innerHTML = "you are in offline";
  }
}

//fund func with dynamic error managment
async function fund() {
  if (window.navigator.onLine) {
    const ethAmount = document.getElementById("inputHeading").value;
    console.log(`Funding with ${ethAmount}...`);
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const transactionResponse = await contract.fund({
          value: ethers.utils.parseEther(ethAmount),
        });

        const fundingValue = Number(transactionResponse.value.toString());

        console.log(fundingValue);
        fundersSome = fundersSome + fundingValue;
        console.log(fundersSome.toString());
        await listenForTransactionMine(transactionResponse, provider);
      } catch (error) {
        console.log(error);
      }
    } else {
      fundButton.innerHTML = "Please install MetaMask";
    }
  } else {
    document.getElementById("metamaskM").innerHTML = "you are in offline";
    document.getElementById("fundButton").innerHTML = "you are in offline";
  }
}

//it is under contruction
async function getBalance() {
  console.log("clicked");
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
      const balanceBigNumber = await provider.getBalance(contractAddress);
      const balance = ethers.utils.formatEther(balanceBigNumber);
      console.log(balance);
      document.getElementById("balanceId").innerHTML = balance;
    } catch (error) {
      console.log(error);
    }
  } else {
    balanceButton.innerHTML = "Please install MetaMask";
  }
}

// helper func.........
function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`);
  return new Promise((resolve, reject) => {
    try {
      console.log(transactionResponse);
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        console.log(transactionReceipt);
        console.log(
          `Completed with ${transactionReceipt.confirmations} confirmations. `
        );
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

document.getElementById("funderheading").innerHTML = fundersSome;
