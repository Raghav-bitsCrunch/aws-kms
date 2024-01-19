import { Transaction as Tx }  from "@ethereumjs/tx";
import { Common } from "@ethereumjs/common";
import { getNonce } from './utilities/nonceManager.mjs'
import { web3 } from './web3-helper/web3.mjs'
import { NETWORK, KMS } from './config/index.mjs';
import * as KMSHelper from './kms.mjs'

// export const createTxByKms = async (txObject) => {
//   const KEY = KMS.TRANSACTION_KEY

//   const adminAddress = await KMSHelper.getEthereumAddress(KEY)

//   console.log('ADMIN BALANCE:', await web3.eth.getBalance(adminAddress))
//   txObject.from = web3.utils.toChecksumAddress(adminAddress)

//   const gasPrice = await web3.eth.getGasPrice()
//   txObject.gasPrice = web3.utils.toHex(gasPrice)

//   const nonceCount = await getNonce(adminAddress)
//   txObject.nonce = web3.utils.toHex(nonceCount)

//   txObject.gasLimit = await web3.eth.estimateGas({
//     to: txObject.to,
//     data: txObject.data,
//     nonce: txObject.nonce,
//     from: adminAddress
//   })

//   const chainId = await web3.eth.getChainId()
//   txObject.chainId = chainId

//   const fetchSign = await KMSHelper.fetchSignature(KEY)
  
//   txObject.r = fetchSign.r
//   txObject.s = fetchSign.s
//   txObject.v = fetchSign.v
//   console.log({txObject});
//     const customChainParams = {
//     name: NETWORK.name,
//     chainId: web3.utils.toHex(chainId),
//     networkId: NETWORK.chainId,
//   };

//   const common = Common.custom(customChainParams);
//   const tx = new Tx(txObject, { common })

  
//   const txHash = tx.hash(false)
//   console.log({txHash});
//   const serializedTx = await KMSHelper.fetchSerializedTx(txHash, tx, KEY)

//   return serializedTx
// }

export const createTxByKms = async (txObject) => {
  
  const KEY = KMS.TRANSACTION_KEY

  const adminAddress = await KMSHelper.getEthereumAddress(KEY)

  console.log('ADMIN BALANCE:', await web3.eth.getBalance(adminAddress))
  const gas = await web3.eth.estimateGas({
    to: txObject.to,
    data: txObject.data,
    from: adminAddress,
  });

  const nonceCount = await getNonce(adminAddress);
  const chainId = await web3.eth.getChainId();

  const gasLimit = BigInt(Math.ceil(Number(gas) * 1.2));

  const gasPrice = await web3.eth.getGasPrice();
  const increasedGasPrice = (BigInt(gasPrice) * BigInt(12)) / BigInt(10);

  const fetchSign = await KMSHelper.fetchSignature(KEY)
  const {r,s,v} = fetchSign

  const payload = {
    ...txObject,
    from: adminAddress,
    nonce: web3.utils.toHex(nonceCount),
    chainId: web3.utils.toHex(chainId),
    gasPrice: web3.utils.toHex(increasedGasPrice),
    gasLimit : web3.utils.toHex(gasLimit),
    r,
    s,
    v
  };


  console.log({payload})
  

  const customChainParams = {
    name: NETWORK.name,
    chainId: web3.utils.toHex(chainId),
    networkId: NETWORK.chainId,
  };
  
  const common = Common.custom(customChainParams);
  const tx = new Tx(payload, { common });

  const txHash = tx.hash(false)
  console.log({txHash});
  const serializedTx = await KMSHelper.fetchSerializedTx(txHash, tx, KEY)

  return serializedTx;
};