import { web3 } from "../web3-helper/index.mjs";
let NONCE = {}
const walletValidator = (wallet) => {
  if (!wallet) throw Error("wallet not received");
  if (!web3.utils.isAddress(wallet)) throw Error("invalid address");
};

export const init = async (wallet) => {
  walletValidator(wallet);
  NONCE[wallet] = await web3.eth.getTransactionCount(wallet, "pending");
  setInterval(async () => {
    NONCE[wallet] = await web3.eth.getTransactionCount(wallet, "pending");
  }, 60000);
};

export const updateNonce = (wallet) => {
  walletValidator(wallet);
  NONCE[wallet]++;
};

export const getNonce = async (wallet) => {
  walletValidator(wallet);
  if (!NONCE[wallet]) await init(wallet);
  return NONCE[wallet]++;
};
