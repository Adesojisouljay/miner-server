import axios from "axios";
import { decryptPrivateKey } from "../../utils/index.js";

// const trxUrl = "http://localhost:1101/api/trx/"
const trxUrl = "https://v2api.ezabay.com/api/trx/"

const usdtContractAdd = "41eca9bc828a3005b9a3b909f2cc5c2a54794de05f"

export const createTronWallet = async () => {
    try {
        const res = await axios.get(`${trxUrl}/address-gen`);
        console.log(res.data)
        return res.data;
    } catch (error) {
        console.log(error)
    }
}

export const sendTrx = async (fromAddress, toAddress, amount, privateKey, coinId) => {
    console.log(coinId, ".....")
    try {
        const decryptedPrivateKey = decryptPrivateKey(privateKey)
        const res = await axios.post(`${trxUrl}sendTrx`, {
            fromAddress,
            toAddress,
            amount,
            privateKey: decryptedPrivateKey,
            contractAddress: coinId === "tether" ? usdtContractAdd : null
        });
        return res.data;
    } catch (error) {
        console.log('Error sending TRX:', error);
        throw error;
    }
};

// Function to get address balance
export const getAddressBalance = async (address, contractAddress = null) => {
    console.log("address", address)
    try {
        let res;
        if(contractAddress) {
            res = await axios.get(`${trxUrl}address-balance/${address}/${contractAddress}`);
        } else {
            res = await axios.get(`${trxUrl}address-balance/${address}`);
        }
        console.log(res.data)
        return res.data;
    } catch (error) {
        console.log('Error getting address info:', error);
        throw error;
    }
};

// getAddressBalance("TL3Vd5TGeUNscSQV7CxkNPB2Nrxsy3GVnE", "41eca9bc828a3005b9a3b909f2cc5c2a54794de05f")

// Function to get transaction fee
export const getTransactionFee = async (fromAddress, toAddress) => {
    try {

        let res = await axios.get(`${trxUrl}transaction-fee/${fromAddress}/${toAddress}/${usdtContractAdd}`)
            console.log(res.data)
        return res.data;
    } catch (error) {
        console.log('Error getting address info:', error);
        throw error;
    }
};
// getTransactionFee("TGpugTNwBLCNnGub7gV3x1V6DH5wU6wxCG", "TL3Vd5TGeUNscSQV7CxkNPB2Nrxsy3GVnE", "41eca9bc828a3005b9a3b909f2cc5c2a54794de05f")

export const checkTransactionStatus = async (txID) => {
    try {
        const res = await axios.get(`${trxUrl}transaction/${txID}`);
        return res.data;
    } catch (error) {
        console.log('Error checking transaction status:', error);
        throw error;
    }
};

// Function to get address transactions
export const getTrxAddressDepositTransactions = async (address) => {
    try {
        const res = await axios.get(`${trxUrl}address-transactions/${address}/${usdtContractAdd}`);
        return res.data;
    } catch (error) {
        console.log('Error retrieving transactions:', error);
    }
};

export const getTronDepositTransactions = async (address) => {
    
    try {

        const res = await axios.get(`${trxUrl}address-transactions/${address}`);
        return res.data;
    } catch (error) {
        console.log('Error retrieving transactions:', error);
    }
};
