import axios from "axios";
import bitcore from "bitcore-lib";
import User from "../../models/Users.js";
import TransactionHistory from "../../models/transactionHistory.js";
import messages from "../../variables/messages.js";
import { activitiesEmail } from "../../utils/nodemailer.js";
import { decryptPrivateKey } from "../../utils/index.js";
import { isValidAddress, isValidTxid } from "./helper.js";

  export const getTestnetBitcoinBalance = async (btcAddress) => {
    try {
      // Fetch the address details from Blockstream Testnet API
      const response = await axios.get(`https://blockstream.info/testnet/api/address/${btcAddress}`);
      
      // Extract funded and spent amounts (in satoshis) from the response 
      const { funded_txo_sum, spent_txo_sum } = response.data.chain_stats;
  
      // Calculate the balance (in satoshis)
      const btcBalance = funded_txo_sum - spent_txo_sum;
  
      // Convert balance from satoshis to Bitcoin (1 BTC = 100,000,000 satoshis)
      const btcBalanceInBTC = btcBalance / 100000000;
  
      console.log("Testnet BTC Balance (in BTC):", btcBalanceInBTC);
  
  
      return btcBalanceInBTC;  // Return the balance in BTC
    } catch (error) {
      console.error("Error fetching Bitcoin Testnet balance:", error);
      throw error;
    }
  };
  
  export const getBitcoinMainnetBalance = async (btcAddress) => {
      try {
        // Fetch the address details from Blockstream API for Mainnet
        const response = await axios.get(`https://blockstream.info/api/address/${btcAddress}`);
        
        // Extract funded and spent amounts (in satoshis) from the response
        const { funded_txo_sum, spent_txo_sum } = response.data.chain_stats;
    
        // Calculate the balance (in satoshis)
        const btcBalance = funded_txo_sum - spent_txo_sum;
    
        // Convert balance from satoshis to Bitcoin (1 BTC = 100,000,000 satoshis)
        const btcBalanceInBTC = btcBalance / 100000000;
    
        // console.log("BTC Balance (in BTC):", btcBalanceInBTC);
    
        return btcBalanceInBTC;  // Return the balance in BTC
      } catch (error) {
        console.error("Error fetching Bitcoin Mainnet balance:", error);
        throw error;
      }
    };

export const checkTransactionStatus = async (input) => {
    try {
      let response;
      
      if (isValidTxid(input)) {
        // Fetch transaction details
        response = await axios.get(`https://blockstream.info/testnet/api/tx/${input}`);
        
       const confirmed = response.data.status.confirmed;
        // console.log("Transaction status:", { input, confirmed});
        return { confirmed, transactionDetails: response.data };

      } else if (isValidAddress(input)) {
        // Fetch address details
        response = await axios.get(`https://blockstream.info/testnet/api/address/${input}`);
        // console.log("Address Details:", response.data);
        return response.data;
      } else {
        throw new Error('Invalid input. Please provide a valid transaction ID or address.');
      }
  
    } catch (error) {
      console.error("Error fetching transaction or address details:", error);
      throw error;
    }
  }; 

export const sendBitcoin = async (senderAddress, senderPrivateKey, receiverAddress, amountToSend) => {
  try {
    // Convert amount to satoshis and ensure it's an integer
    const satoshiToSend = Math.floor(amountToSend * 100000000);
    let fee = 0;
    let inputCount = 0;
    let outputCount = 2; // Output count: 1 for receiver, 1 for change

    // Fetch recommended fee
    const recommendedFee = await axios.get(
      "https://mempool.space/api/v1/fees/recommended"
    );
    const feeRate = recommendedFee.data.hourFee; // satoshis per byte

    // Initialize transaction
    const transaction = new bitcore.Transaction();
    let totalAmountAvailable = 0;
    let inputs = [];

    // Fetch UTXOs
    const resp = await axios.get(
      `https://blockstream.info/testnet/api/address/${senderAddress}/utxo`
    );
    const utxos = resp.data;

    // Prepare inputs
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

    if (totalAmountAvailable - satoshiToSend - fee < 0) {
      throw new Error("Balance is too low for this transaction");
    }

    // Set transaction inputs, outputs, and fee
    transaction.from(inputs);
    transaction.to(receiverAddress, satoshiToSend);
    transaction.change(senderAddress);
    transaction.fee(Math.round(fee));

    // Sign the transaction
    const decryptedPrivateKey = decryptPrivateKey(senderPrivateKey);
    transaction.sign(decryptedPrivateKey);

    // Serialize and send the transaction
    const serializedTransaction = transaction.serialize();
    const result = await axios.post(
      `https://blockstream.info/testnet/api/tx`,
      serializedTransaction,
      { headers: { 'Content-Type': 'text/plain' } }
    );

    console.log(".....message sent.....",result.data)

    return result.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getBitcoinAddressTransactions = async (address) =>{
  try {
    const response = await axios.get(`https://blockstream.info/testnet/api/address/${address}/txs`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export async function watchAllBitcoinDeposits() {
  const users = await User.find({ 'assets.currency': 'bitcoin' }); 

  for (const user of users) {
    user.assets.forEach(asset => {
      if (asset.currency === 'bitcoin' && asset.depositAddress) {
        watchBitcoinDeposits(asset.depositAddress);
      }
    });
  }
}

export async function watchBitcoinDeposits(address) {
  try {
    const transactions = await getBitcoinAddressTransactions(address);
    
    for (const tx of transactions) {
      for (const output of tx.vout) {
        if (output.scriptpubkey_address === address) {
          // Satoshi to BTC
          const amountInBTC = output.value / 100000000;  
          
          const user = await User.findOne({ 'assets.depositAddress': address });
          
          if (!user || user.username === 'Ekzahot') {
            console.log('User not found or is excluded:', user ? user.username : 'No user');
            continue;
          }
          
          //we need to check sceniaro where a user on our exchange sends to another user on our exchnage, in that we should avoid duplication
          const existingTransaction = await TransactionHistory.findOne({ trxId: tx.txid });
          if (existingTransaction) {
            console.log('Transaction already recorded, skipping...', tx.txid);
            continue;
          }

          const newTransaction = new TransactionHistory({
            userId: user._id,
            trxId: tx.txid,
            amount: amountInBTC,
            currency: 'bitcoin',
            type: 'Crypto deposit',
            receiver: address,
            status: 'pending',
            timestamp: new Date(),
          });

          await newTransaction.save();

          const emailContent = messages.cryptoDepositProcessingEmail(user.username, amountInBTC, "bitcoin", tx.txid);
          await activitiesEmail(user.email, messages.cryptoDepositProcessingSubject, emailContent);
        }
      }
    }
  } catch (error) {
    console.error("Error watching for deposits:", error);
  }
}

export const processPendingTransactions = async () => {
  try {
    const pendingTransactions = await TransactionHistory.find({ status: 'pending', type: 'Crypto deposit' });
    for (const tx of pendingTransactions) {

      if(tx.currency === "bitcoin") {

        const { confirmed, transactionDetails } = await checkTransactionStatus(tx.trxId);
  
        if (confirmed) {
          const user = await User.findById(tx.userId);
  
          if (user) {
            const asset = user.assets.find(asset => asset.currency === 'bitcoin');
  
            if (asset && asset.depositAddress) {
              asset.balance += Number(tx.amount);
  
              asset.asseUsdtWorth = asset.balance * asset.usdValue;
              asset.assetNairaWorth = asset.balance * asset.nairaValue;
          
              user.totalUsdValue = user.assets.reduce((total, asset) => total + (asset.asseUsdtWorth || 0), 0);
              user.totalNairaValue = user.assets.reduce((total, asset) => total + (asset.assetNairaWorth || 0), 0);
              await user.save();
  
              tx.status = 'confirmed';
              tx.blockNumber = transactionDetails.status.block_height;
  
              await tx.save();
  
                const emailContent = messages.cryptoDepositConfirmedEmail(user.username, tx.amount, asset.currency, tx.trxId);
                activitiesEmail(user.email, messages.cryptoDepositConfirmedSubject, emailContent);
  
              console.log(`Transaction ${tx.trxId} confirmed. User ${user.username}'s BTC balance updated.`);
            } else {
              console.error(`User ${user.username} does not have a BTC deposit address. Skipping transaction ${tx.trxId}.`);
            }
          }
        }
        
      }

    }
  } catch (error) {
    console.error("Error processing pending transactions:", error);
    throw error;
  }
};

