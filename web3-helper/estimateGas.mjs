import { web3 } from ".";

export const estimateGas = async (txObject,fromAddress) => {
  try {
    const gas = await web3.eth.estimateGas({
      to: txObject.to,
      data: txObject.data,
      from: fromAddress,
    });
    if(gas)
      return true
    else return false
  } catch (error) {
    return false
  }
};
