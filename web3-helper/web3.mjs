import { Web3 } from 'web3'
import { NETWORK } from '../config/index.mjs'

const web3 = new Web3(NETWORK.RPC_URL)
const web3Event = new Web3(NETWORK.WEB_SOCKET.URL)

export {web3, web3Event}
