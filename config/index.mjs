'use strict'

import dotenv from 'dotenv'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import contractInfo from './contract.mjs'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const CONTRACTS = {
    "BCUT":{
      "abi":contractInfo.BCUT_TOKEN_ABI,
      "address":contractInfo.BCUT_TOKEN_ADDRESS
    },
    "EPOCH_MANAGER":{
      "abi":contractInfo.EPOCH_MANAGER_ABI,
      "address":contractInfo.EPOCH_MANAGER_ADDRESS
    },
    "BITSCRUNCH":{
      "abi":contractInfo.BITSCRUNCH_FACTORY_ABI,
      "address":contractInfo.BITSCRUNCH_FACTORY_ADDRESS
    },
    "REWARD_MANAGER":{
      "abi":contractInfo.REWARD_MANAGER_ABI,
      "address":contractInfo.REWARD_MANAGER_ADDRESS
    },
    "OPERATOR":{
      "abi":contractInfo.OPERATOR_ABI,
      "address":contractInfo.OPERATOR_ADDRESS
    },
    "STAKING":{
      "abi":contractInfo.STAKING_ABI,
      "address":contractInfo.STAKING_ADDRESS
    },
    "ERC20":{
      "abi":contractInfo.BCUT_TOKEN_ABI
    },
    "CONTRIBUTOR_STAKING":{
      "abi":contractInfo.CONTRIBUTOR_STAKING_ABI,
      "address":contractInfo.CONTRIBUTOR_STAKING_ADDRESS
    },
}

const NETWORK = {    
  name:process.env.NETWORK,    
  chainId:process.env.CHAINID,    
  RPC_URL:process.env.RPC,
  WEB_SOCKET:{
    URL: process.env.WEB_SOCKET,
    RETRIES: process.env.WEB_SOCKET_RETIES
  }
}

const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY
const MANAGER_PRIVATE_KEY = process.env.MANAGER_PRIVATE_KEY

const KMS = {
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  REGION: process.env.AWS_REGION,
  API_VERSION: process.env.AWS_API_VERSION,
  KEY_IDS: {
    ADMIN: process.env.ADMIN_KEY_ID
  },
  TRANSACTION_KEY: 'ADMIN',
  SIGNATURE_KEY: 'ADMIN'
}


export {
  CONTRACTS,
  NETWORK,
  ADMIN_PRIVATE_KEY,
  MANAGER_PRIVATE_KEY,
  KMS
}
