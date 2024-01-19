import { web3 } from './index.mjs'

export const convertToEther = (weiValue) =>{
    return Number(web3.utils.fromWei(String(weiValue),'ether'))
}

export const convertToWei = (etherValue) =>{
    return web3.utils.toWei(String(etherValue),'ether')
}

export const getSigner = async (message, signature) => {
    const signer = web3.eth.accounts.recover(message,signature)
    return signer
}

export const convertFromDecimals = (value, decimals) =>{
    return value / Math.pow(10, decimals);
}

export const convertToDecimals = (value, decimals) =>{
    return value * Math.pow(10, decimals);
}