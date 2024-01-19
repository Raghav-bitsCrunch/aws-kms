import { web3, sendTx } from './web3-helper/index.mjs'
import { CONTRACTS } from './config/index.mjs'
const { abi, address} = CONTRACTS.BCUT

const contractInstance = new web3.eth.Contract(abi,address)

const pushTxToBlockchain = async () => {
    console.log("Triggered pushTxToBlockchain")
    const txObject = {
      data : contractInstance.methods.mint("0x99eF3Dc34DD274AAa876c8131b3dE2a1BaC74ee9",10e18).encodeABI(),
      value : '0x00',
      to: address
    }
    await sendTx(txObject)
    console.log("Chain Scheme Creation Done")
}

pushTxToBlockchain()
