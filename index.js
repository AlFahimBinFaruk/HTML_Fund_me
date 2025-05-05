import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const withdrawButton = document.getElementById("withdrawButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");


connectButton.onclick = connect;
withdrawButton.onclick = withdraw;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;



async function connect() {
  // metamask is installed.
  if (typeof window.ethereum !== "undefined") {
    const ethereum = window.ethereum;
    try {
      //pop metamask for connection req.
      await ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.log(error);
    }
    connectButton.innerHTML = "Connected";
    //get details of connected account
    const accounts = await ethereum.request({ method: "eth_accounts" });
    console.log(accounts);
  } else {
    connectButton.innerHTML = "Please install MetaMask";
  }
}




async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`Funding with ${ethAmount}...`);
  if (typeof window.ethereum !== "undefined") {
    // it creates a new web3 provider using window.ethereum,which allows our app to communicate with etherium blockchain.
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // request access to user metamask account if not already connected.
    await provider.send("eth_requestAccounts", []);
    // this will get the account from metamask, that is currently selected amount the connected accounts to our app.
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(transactionResponse, provider);
      console.log(`Funded ${ethers.utils.parseEther} ETH successfully.`);
    } catch (error) {
      console.log("funding error => ",error);
    }
  } else {
    fundButton.innerHTML = "Please install MetaMask";
  }
}



async function withdraw() {
  console.log(`Withdrawing...`);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const balance = await provider.getBalance(contractAddress);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
      await transactionResponse.wait(1);
      console.log(`Withdrawed ${ethers.utils.parseEther} ETH successfully.`);
    } catch (error) {
      console.log("withdraw error => ",error);
    }
  } else {
    withdrawButton.innerHTML = "Please install MetaMask";
  }
}



async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
      const balance = await provider.getBalance(contractAddress);
      console.log(`Account balance is ${ethers.utils.formatEther(balance)} ETH`);
    } catch (error) {
      console.log(error);
    }
  } else {
    balanceButton.innerHTML = "Please install MetaMask";
  }
}



function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`);
  return new Promise((resolve, reject) => {
    try {
      provider.once(transactionResponse.hash, (transactionReceipt) => {
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