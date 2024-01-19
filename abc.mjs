import { AwsKmsSigner } from "ethers-aws-kms-signer";
import * as config from './config/index.mjs'
import { ethers }  from 'ethers'
const kmsCredentials = {
  accessKeyId: config.KMS.AWS_ACCESS_KEY_ID, // credentials for your IAM user with KMS access
  secretAccessKey: config.KMS.AWS_SECRET_ACCESS_KEY, // credentials for your IAM user with KMS access
  region: config.KMS.REGION,
  keyId: config.KMS.KEY_IDS['ADMIN'],
};

const provider = new ethers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/VG_IJiT8-Kjt-Tysdnali6mi0k38GKKS");
let signer = new AwsKmsSigner(kmsCredentials);
signer = signer.connect(provider);

const tx = await signer.sendTransaction({ to: "0xE94E130546485b928C9C9b9A5e69EB787172952e", value: 1 });
console.log(tx);
