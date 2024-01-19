import { Transaction as Tx}  from "@ethereumjs/tx";
import { Common } from "@ethereumjs/common";
//import { getAdminWallet, getManagerWallet } from '../wallet-manager/admin.mjs'
import { web3 } from './index.mjs'
import { getNonce } from '../utilities/nonceManager.mjs'
import {NETWORK} from '../config/index.mjs'
import { createTxByKms } from '../createTx.mjs'

// const createTx = async (txObject, specialWallet = false) => {

//     const ADMIN_WALLET = specialWallet ? await getManagerWallet() : await getAdminWallet();
//     const adminAddress = ADMIN_WALLET.address
  
//     const gas = await web3.eth.estimateGas({
//       to: txObject.to,
//       data: txObject.data,
//       from: adminAddress,
//     });

//     const nonceCount = await getNonce(adminAddress);
//     const chainId = await web3.eth.getChainId();

//     const gasLimit = BigInt(Math.ceil(Number(gas) * 1.2));

//     const gasPrice = await web3.eth.getGasPrice();
//     const increasedGasPrice = (BigInt(gasPrice) * BigInt(12)) / BigInt(10);

//     const payload = {
//       ...txObject,
//       from: adminAddress,
//       nonce: web3.utils.toHex(nonceCount),
//       chainId: web3.utils.toHex(chainId),
//       gasPrice: web3.utils.toHex(increasedGasPrice),
//       gasLimit : web3.utils.toHex(gasLimit)
//     };


//     console.log({payload})
    
//     const privateKey = Buffer.from(ADMIN_WALLET.privateKey.replace(/^0x/, ''), 'hex');
  
//     const customChainParams = {
//       name: NETWORK.name,
//       chainId: web3.utils.toHex(chainId),
//       networkId: NETWORK.chainId,
//     };
    
//     const common = Common.custom(customChainParams);
//     const tx = new Tx(payload, { common });
  
//     const txn = tx.sign(privateKey);
//     const serializedTx = txn.serialize();

//     return "0x" + serializedTx.toString("hex");
// };

export const sendTx = async (txObject) => {
  try {
    //const txSerialized = await createTx(txObject,specialWallet)
    const txSerialized = await createTxByKms(txObject)
    console.log({txSerialized});
    web3.eth.sendSignedTransaction(txSerialized)
    .on('transactionHash', async (txHash) => {
      console.log('Transaction Hash ---, TxHash: ' + txHash)
    })
    .on('receipt', async (rc) => {
      console.log(`Transaction Status: ${(rc.status ? 'Successful' : 'Failed')}`)
    })
    .on('error', async (web3err) => {
      console.log('Transaction Error ---, TxHash: ' + web3err)
    })
  } catch (error) {
   
    console.log(error)
  }
}