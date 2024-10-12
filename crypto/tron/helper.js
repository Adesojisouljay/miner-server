import axios from "axios";
// import User from "../models/Users.js";
import User from "../../models/Users.js";
import { getAddressBalance, getTransactionFee, sendTrx } from "./index.js";

const usdtContractAdd = "41eca9bc828a3005b9a3b909f2cc5c2a54794de05f"

const isValidTrxAddress = true

export const sendTrxFromHotWallet = async (coinId, receiverAddress, amount) => {
    try {
        const hot = await User.findOne({ username: "Ekzahot" });
        if (!hot) {
            throw new Error('Hot wallet user not found');
        }
  
        const hotAsset = hot.assets.find(asset => asset.coinId === coinId);
        console.log(hotAsset)
        if (!hotAsset) {
            throw new Error('Hot wallet asset not found');
        }
  
        const result = await sendTrx(hotAsset.depositAddress, receiverAddress, amount, hotAsset.privateKey, coinId);
        console.log(result)
  
        return result;
    } catch (error) {
        console.error('Error sending from hot wallet:', error);
        throw error;
    }
  };

  export const calculateTransactionFee = async (fromAddress, toAddress) => {
    try {
        const fee = await getTransactionFee(fromAddress, toAddress)
        console.log(fee)
        return fee
    } catch (error) {
        
    }
  }

  const getBalance = async () => {
    try {
        const bal = await getAddressBalance()
    } catch (error) {
        console.log(error)
    }
  }
