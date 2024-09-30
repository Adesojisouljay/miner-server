import axios from "axios";
import bitcore from "bitcore-lib";

  // Helper function to validate a transaction ID
  export const isValidTxid = (input) => {
    // Bitcoin transaction IDs are usually 64-character hex strings
    return /^[a-fA-F0-9]{64}$/.test(input);
  };
  
  // Helper function to validate a Bitcoin address
  export const isValidAddress = (input) => {
    //validation for Bitcoin addresses (both testnet and mainnet)
    return /^[13mn2][a-zA-Z0-9]{25,39}$/.test(input);
  };

export const calculateSweepableAmount = async (senderAddress) => {
    try {
      let inputCount = 0;
      let outputCount = 2; // 1 for receiver, 1 for change
      let totalAmountAvailable = 0;
      let fee = 0;
  
      const recommendedFee = await axios.get("https://mempool.space/api/v1/fees/recommended");
      const feeRate = recommendedFee.data.hourFee; // satoshis per byte
  
      const resp = await axios.get(`https://blockstream.info/testnet/api/address/${senderAddress}/utxo`);
      const utxos = resp.data;
  
      // Prepare inputs
      let inputs = [];
      for (const utxo of utxos) {
        inputs.push({
          satoshis: utxo.value,
          script: bitcore.Script.buildPublicKeyHashOut(senderAddress).toHex(),
          address: senderAddress,
          txId: utxo.txid,
          outputIndex: utxo.vout,
        });
        totalAmountAvailable += utxo.value;
        inputCount += 1;
      }
  
      // Calculate transaction size and fee
      const transactionSize = inputCount * 180 + outputCount * 34 + 10 - inputCount;
      fee = transactionSize * feeRate;
  
      // Check if balance is sufficient
      if (totalAmountAvailable - fee < 0) {
        console.log("Balance is too low for this transaction");
      }
  
      // Return the amount to sweep (balance - fee)
      return parseFloat(((totalAmountAvailable - fee) / 100000000).toFixed(8)); // convert to BTC
    } catch (error) {
      console.error("Error calculating sweep amount:", error);
    //   throw error;
    }
  };
  
  export const calculateTransactionFee = async (inputCount = 1, outputCount = 2) => {
    try {
      // Fetch the recommended fee from the network
      const recommendedFee = await axios.get("https://mempool.space/api/v1/fees/recommended");
      const feeRate = recommendedFee.data.hourFee; // satoshis per byte
  
      // Calculate transaction size in bytes
      const transactionSize = inputCount * 180 + outputCount * 34 + 10 - inputCount;
  
      // Calculate total fee in satoshis
      const totalFeeInSatoshis = Math.round(transactionSize * feeRate);
  
      // Convert satoshis to Bitcoin (1 BTC = 100,000,000 satoshis)
      const totalFeeInBTC = (totalFeeInSatoshis / 100000000).toFixed(8); // 8 decimal places for Bitcoin
      console.log({
        feeInSatoshis: totalFeeInSatoshis,
        feeInBTC: totalFeeInBTC
      })
  
      return {
        feeInSatoshis: totalFeeInSatoshis,
        feeInBTC: totalFeeInBTC
      };
    } catch (error) {
      console.error("Error calculating transaction fee:", error);
      throw error;
    }
  };

  
    