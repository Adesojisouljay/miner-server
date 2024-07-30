import { PrivateKey } from "@hiveio/dhive";
import client from './client.js';
import axios from "axios";
import TransactionHistory from "../models/transactionHistory.js";

const key = process.env.HIVE_P_KEY
const acc = process.env.HIVE_ACC

export const getWithdrawalDetails = async (trxId, retries = 5, delay = 2000) => {
    const url = 'https://api.hive.blog';
    const params = {
      jsonrpc: "2.0",
      method: "account_history_api.get_transaction",
      params: { id: trxId },
      id: 1
    };
  
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.post(url, params);
        console.log("object", response.data);
        if (response.data.result) {
          return response.data.result;
        } else {
          console.log('Transaction details not available yet.');
        }
      } catch (error) {
        if (i === retries - 1) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

export const transferOp = async (to, amount, memo) => {
    const args = {
      from: acc,
      to,
      amount,
      memo
    };
  
    try {
      const privateKey = PrivateKey.fromString(key);
  
      const result = await client.broadcast.transfer(args, privateKey);
      console.log(result);
  
      return result;
    } catch (error) {
      console.error('Error processing Hive transfer:', error);
      throw error;
    }
  };