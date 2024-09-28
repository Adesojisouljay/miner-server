import pkg from 'bitcore-lib';
import  { mainnet, testnet } from "bitcore-lib/lib/networks.js";

const { PrivateKey } = pkg;

export const createBtcWallet = (network = testnet) => {

  const privateKey = new PrivateKey();
  const address = privateKey.toAddress(network);

  console.log({privateKey: privateKey.toString(), address: address.toString(),})
  return {
    privateKey: privateKey.toString(),
    address: address.toString(),
  };
};
