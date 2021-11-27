const Web3 = require('web3')
const erc20Abi = require('./abis/erc20.json')
const TokenAbi = require('./abis/YieldSourcePrizePool.json')   
const BigNumber = require('bignumber.js')   

const provider = new Web3.providers.HttpProvider("http://127.0.0.1:8545")
var web3 = new Web3(provider)
var ownerAddress = "0xf60c2Ea62EDBfE808163751DD0d8693DCb30019c"
var userAddress = "0xf60c2Ea62EDBfE808163751DD0d8693DCb30019c"
var assetAddress = "0x6b175474e89094c44da98b954eedeac495271d0f"
var tokenAddress = TokenAbi.address;
console.log(tokenAddress)
var ethWeiDecimals;
amountToSwap = 10
allowedAmount = 12
amountWithdraw = 9
var TokenContract = new web3.eth.Contract(TokenAbi.abi, tokenAddress);
var AssetContract = new web3.eth.Contract(erc20Abi, assetAddress);
// var OwnerContract = new web3.eth.Contract(erc20Abi, ownerAddress);
// console.log(StakePrizePoolContract)

async function driverCode(){
    const decimal = await AssetContract.methods.decimals().call()
    ethWeiDecimals = parseInt(decimal);
    amountToSwapWei = new BigNumber(amountToSwap).shiftedBy(ethWeiDecimals);
    amountToAllow = new BigNumber(allowedAmount).shiftedBy(ethWeiDecimals);
    amountToWithdraw = new BigNumber(amountWithdraw).shiftedBy(ethWeiDecimals);
    var assetBalance = await AssetContract.methods.balanceOf(userAddress).call();
    console.log(amountToSwapWei)
    console.log(amountToAllow)
    console.log(assetBalance)
     
    approveSpender()

    async function approveSpender() {
        await AssetContract.methods
          .approve(tokenAddress, amountToAllow)
          .send({ from: ownerAddress }, async (err, tx) => {
            if (err) console.log(`ERC20 token approving failed: ${err}`);
            console.log(`ERC20 token approved to: ${tokenAddress}`);
            await awaitTransaction(tx);
            await executeDeposit();
          });
      }
      
      async function awaitTransaction(tx) {
        var receipt = null;
        do {
          await web3.eth.getTransactionReceipt(tx).then(res => {
            if (res) receipt = res;
            wait(2000);
          });
        } while (receipt === null);
        console.log(`Transactions went successfull: ${receipt.transactionHash}`);
        return receipt.status;
      }

      function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

    async function executeDeposit() {
     await TokenContract.methods.depositTo(
        ownerAddress,
        amountToSwapWei
    ).send({from: ownerAddress})
    .once('receipt', (reciept) => {
        console.log(reciept)
    })
} 

//   async function earlyWithdraw() {
//     await TokenContract.methods.withdrawFrom(
//         userAddress,
//         amountToWithdraw
//     ).send({from: ownerAddress})
//     .once("receipt", (reciept) => {
//         console.log(reciept)
//     })
// }
}


driverCode()
