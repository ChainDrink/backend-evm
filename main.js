// const { ApiPromise, WsProvider } = require("@polkadot/api");
// const { Abi } = require('@polkadot/api-contract');
const { Web3 } = require('web3');
const fs = require('fs').promises;
const { execSync } = require("child_process");

const CONTRACT_ADDRESS = "0x9417b2a92979C2aD4d5Ee074bd1217f6b6D6E330";

async function main() {
  const provider = new Web3.providers.HttpProvider("https://rpc.testnet.mantle.xyz")
  const web3 = new Web3(provider);
  const abi = JSON.parse(await fs.readFile("./abi.json", "utf-8"));
  const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
  let latestCheck = await web3.eth.getBlockNumber()
  let latestHash = ""

  while (true) {
    let currentCheck = await web3.eth.getBlockNumber()
    if(latestCheck === currentCheck ) {
      continue;
    }
    const events = await contract.getPastEvents("Received", {fromBlock: latestCheck, toBlock: currentCheck})
    latestCheck = currentCheck
    events.forEach((event) => {
      if(latestHash !== event.transactionHash) {
        console.log(web3.utils.fromWei(event.returnValues.value, "ether"))
        console.log(event.returnValues.value)
        execSync("ls", {stdio: 'inherit'})
        latestHash = event.transactionHash
      }
    })
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(-1);
});
