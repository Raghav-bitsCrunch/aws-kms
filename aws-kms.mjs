import pkg from 'aws-sdk';
const { KMS } = pkg;
import asn1 from 'asn1.js'
import pkg1 from 'js-sha3';
const { keccak256 } = pkg1;
import * as ethutil from "ethereumjs-util"
import Web3 from "web3"
import BN from "bn.js"
import { Transaction } from "ethereumjs-tx"
import * as config from './config/index.mjs'
import { Common, CustomChain, Hardfork } from "@ethereumjs/common";
import { getNonce } from './utilities/nonceManager.mjs'

const chainId = "80001"; // Polygon Mumbai chain ID

const kms = new KMS({
    accessKeyId: config.KMS.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.KMS.AWS_SECRET_ACCESS_KEY,
    region: config.KMS.REGION,
    apiVersion: config.KMS.API_VERSION
})

const keyId = config.KMS.KEY_IDS['ADMIN']

const EcdsaSigAsnParse = asn1.define("EcdsaSig", function() {
  // parsing this according to https://tools.ietf.org/html/rfc3279#section-2.2.3
  this.seq().obj(this.key("r").int(), this.key("s").int())
})

const EcdsaPubKey = asn1.define("EcdsaPubKey", function() {
  // parsing this according to https://tools.ietf.org/html/rfc5480#section-2
  this.seq().obj(
    this.key("algo")
      .seq()
      .obj(this.key("a").objid(), this.key("b").objid()),
    this.key("pubKey").bitstr()
  )
})

async function sign(msgHash, keyId) {
  const params = {
    // key id or 'Alias/<alias>'
    KeyId: keyId,
    Message: msgHash,
    // 'ECDSA_SHA_256' is the one compatible with ECC_SECG_P256K1.
    SigningAlgorithm: "ECDSA_SHA_256",
    MessageType: "DIGEST"
  }
  const res = await kms.sign(params).promise()
  return res
}

async function getPublicKey(keyPairId) {
  return kms
    .getPublicKey({
      KeyId: keyPairId
    })
    .promise()
}

function getEthereumAddress(publicKey) {
  console.log("Encoded Pub Key: " + publicKey.toString("hex"))

  // The public key is ASN1 encoded in a format according to
  // https://tools.ietf.org/html/rfc5480#section-2
  // I used https://lapo.it/asn1js to figure out how to parse this
  // and defined the schema in the EcdsaPubKey object
  let res = EcdsaPubKey.decode(publicKey, "der")
  let pubKeyBuffer = res.pubKey.data

  // The public key starts with a 0x04 prefix that needs to be removed
  // more info: https://www.oreilly.com/library/view/mastering-ethereum/9781491971932/ch04.html
  pubKeyBuffer = pubKeyBuffer.slice(1, pubKeyBuffer.length)

  const address = keccak256(pubKeyBuffer) // keccak256 hash of publicKey
  const buf2 = Buffer.from(address, "hex")
  const EthAddr = "0x" + buf2.slice(-20).toString("hex") // take last 20 bytes as ethereum adress
  console.log("Generated Ethreum address: " + EthAddr)
  return EthAddr
}

async function findEthereumSig(plaintext) {
  let signature = await sign(plaintext, keyId)
  if (signature.Signature == undefined) {
    throw new Error("Signature is undefined.")
  }
  console.log("encoded sig: " + signature.Signature.toString("hex"))

  let decoded = EcdsaSigAsnParse.decode(signature.Signature, "der")
  let r = decoded.r
  let s = decoded.s
  console.log("r: " + r.toString(10))
  console.log("s: " + s.toString(10))

  let tempsig = r.toString(16) + s.toString(16)

  let secp256k1N = new BN(
    "fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141",
    16
  ) // max value on the curve
  let secp256k1halfN = secp256k1N.div(new BN(2)) // half of the curve
  // Because of EIP-2 not all elliptic curve signatures are accepted
  // the value of s needs to be SMALLER than half of the curve
  // i.e. we need to flip s if it's greater than half of the curve
  if (s.gt(secp256k1halfN)) {
    console.log(
      "s is on the wrong side of the curve... flipping - tempsig: " +
        tempsig +
        " length: " +
        tempsig.length
    )
    // According to EIP2 https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2.md
    // if s < half the curve we need to invert it
    // s = curve.n - s
    s = secp256k1N.sub(s)
    console.log("new s: " + s.toString(10))
    return { r, s }
  }
  // if s is less than half of the curve, we're on the "good" side of the curve, we can just return
  return { r, s }
}

function recoverPubKeyFromSig(msg, r, s, v) {
  console.log(
    "Recovering public key with msg " +
      msg.toString("hex") +
      " r: " +
      r.toString(16) +
      " s: " +
      s.toString(16)
  )
  let rBuffer = r.toBuffer()
  let sBuffer = s.toBuffer()
  let pubKey = ethutil.ecrecover(msg, v, rBuffer, sBuffer)
  let addrBuf = ethutil.pubToAddress(pubKey)
  var RecoveredEthAddr = ethutil.bufferToHex(addrBuf)
  console.log("Recovered ethereum address: " + RecoveredEthAddr)
  return RecoveredEthAddr
}

function findRightKey(msg, r, s, expectedEthAddr) {
  // This is the wrapper function to find the right v value
  // There are two matching signatues on the elliptic curve
  // we need to find the one that matches to our public key
  // it can be v = 27 or v = 28
  let v = 27
  let pubKey = recoverPubKeyFromSig(msg, r, s, v)
  if (pubKey != expectedEthAddr) {
    // if the pub key for v = 27 does not match
    // it has to be v = 28
    v = 28
    pubKey = recoverPubKeyFromSig(msg, r, s, v)
  }
  console.log("Found the right ETH Address: " + pubKey + " v: " + v)
  return { pubKey, v }
}

txTest()
async function txTest() {
  const web3 = new Web3(
    new Web3.providers.HttpProvider("https://polygon-mumbai.g.alchemy.com/v2/VG_IJiT8-Kjt-Tysdnali6mi0k38GKKS")
  )

  let pubKey = await getPublicKey(keyId)
  let ethAddr = getEthereumAddress(pubKey.PublicKey)
  let ethAddrHash = ethutil.keccak(Buffer.from(ethAddr))
  let sig = await findEthereumSig(ethAddrHash)
  let recoveredPubAddr = findRightKey(ethAddrHash, sig.r, sig.s, ethAddr)
  const chainId = await web3.eth.getChainId();
  const nonceCount = await getNonce(ethAddr);
  
  const txParams= {
    nonce: web3.utils.toHex(nonceCount),
    gasPrice: '0x0918400000',
    gasLimit: 160000,
    to: '0x0000000000000000000000000000000000000000',
    value: '0x00',
    data: '0x00',
    r: sig.r.toBuffer(),
    s: sig.s.toBuffer(),
    v: recoveredPubAddr.v
}

  console.log(txParams)
  const common = Common.custom(CustomChain.PolygonMumbai);

  //const common = Common.custom(commonMumbai);
//   const tx = new Transaction(txParams, { common });
// //   const tx = new Transaction(txParams, {
// //     name: config.NETWORK.name,
// //     chainId: web3.utils.toHex(chainId),
// //     networkId: config.NETWORK.chainId,
// //   })
const tx = new Transaction(txParams, { common });

  console.log({tx});

  let txHash = tx.hash(false)
  sig = await findEthereumSig(txHash)
  recoveredPubAddr = findRightKey(txHash, sig.r, sig.s, ethAddr)
  tx.r = sig.r.toBuffer()
  tx.s = sig.s.toBuffer()
  tx.v = new BN(recoveredPubAddr.v).toBuffer()
  console.log(tx.getSenderAddress().toString("hex"))

  // Send signed tx to ethereum network
  const serializedTx = tx.serialize().toString("hex")
  web3.eth
    .sendSignedTransaction("0x" + serializedTx)
    .on("confirmation", (confirmationNumber, receipt) => {})
    .on("receipt", txReceipt => {
      console.log(
        "signAndSendTx txReceipt. Tx Address: " + txReceipt.transactionHash
      )
    })
    .on("error", error => console.log(error))
}