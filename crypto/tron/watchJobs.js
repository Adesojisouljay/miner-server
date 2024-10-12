import { getTrxAddressDepositTransactions, getTronDepositTransactions, checkTransactionStatus, getAddressBalance } from "./index.js";
import User from "../../models/Users.js";
import TransactionHistory from "../../models/transactionHistory.js";
import { trc20Tokens } from "../../variables/trc20Tokens.js";
import messages from "../../variables/messages.js"
import {activitiesEmail} from "../../utils/nodemailer.js"
import SweptTransaction from "../../models/SweepTransactions.js";
import { calculateTransactionFee } from "./helper.js";
import { sendTrx } from "./index.js";

const usdtContractAdd = "41eca9bc828a3005b9a3b909f2cc5c2a54794de05f"

// Function to process Tron deposit transactions
const watchTronAddressDeposit = async (address) => {
    const transactions = await getTronDepositTransactions(address);
    // console.log(address)

    if (transactions) {
        for (const transaction of transactions) {
            const trxValue = transaction.raw_data.contract[0].parameter.value;

            const user = await User.findOne({ 'assets.depositAddress': address });

            if (!user || user.username === 'Ekzahot') {
                console.log('User not found or is excluded:', user ? user.username : 'No user');
                continue;
            }

            // Check if the transaction already exists before processing
            const existingTransaction = await TransactionHistory.findOne({ trxId: transaction.txID });

            if (existingTransaction) {
                console.log(`Tron Transaction ${transaction.txID} already recorded for user ${user.username}, skipping...`);
                continue;
            }

            const amount = (trxValue.amount / 1000000).toFixed(3)

            // Lock the transaction to avoid concurrency issues
            console.log(`Processing new transaction ${transaction.txID} for user ${user.username}`);

            const newTransaction = new TransactionHistory({
                userId: user._id,
                trxId: transaction.txID,
                amount: amount,
                currency: "tron",
                type: 'Crypto deposit',
                receiver: trxValue.to_address,
                sender: trxValue.owner_address,
                status: 'pending',
                timestamp: new Date(),
            });

            try {
                await newTransaction.save();  // Save the new transaction

                ///handke email here

            } catch (error) {
                if (error.code === 11000) {
                    console.log(`Duplicate transaction ${transaction.txID}, skipping...`);
                } else {
                    console.error('Error saving transaction:', error);
                }
            }
        }
    }
};

// Function to process TRX token deposit transactions
const watchTrxTokensAddressDeposit = async (address) => {
    const transactions = await getTrxAddressDepositTransactions(address);

    if (transactions) {
        for (const transaction of transactions) {
            const user = await User.findOne({ 'assets.depositAddress': address });

            if (!user || user.username === 'Ekzahot') {
                console.log('User not found or is excluded:', user ? user.username : 'No user');
                continue;
            }

            // Check if the transaction already exists before processing
            const existingTransaction = await TransactionHistory.findOne({ trxId: transaction.transaction_id });

            if (existingTransaction) {
                console.log(`Transaction ${transaction.transaction_id} already recorded for user ${user.username}, skipping...`);
                continue;
            }

            const amount = (transaction.result.value/ 1000000).toFixed(3)

            // Lock the transaction to avoid concurrency issues
            console.log(`Processing new transaction ${transaction.transaction_id} for user ${user.username} ${transaction.result.value} USDT`);

            const newTransaction = new TransactionHistory({
                userId: user._id,
                trxId: transaction.transaction_id,
                amount: amount,
                currency: "tether",
                type: 'Crypto deposit',
                receiver: transaction.result.to,
                sender: transaction.result.owner_address, // Correct sender
                status: 'pending',
                timestamp: new Date(),
            });

            try {
                await newTransaction.save();  // Save the new transaction

                ///handle email here
            } catch (error) {
                if (error.code === 11000) {
                    console.log(`Duplicate transaction ${transaction.transaction_id}, skipping...`);
                } else {
                    console.error('Error saving transaction:', error);
                }
            }
        }
    }
};

// Function to watch all users' TRX token deposits
export async function watchAllTrxDeposits() {
    const users = await User.find();

    for (const user of users) {
        user.assets.forEach(asset => {
            if (trc20Tokens.includes(asset.currency) && asset.depositAddress) {
                watchTrxTokensAddressDeposit(asset.depositAddress);
            }
        });
    }
}

// Function to watch all users' Tron deposits
export async function watchAllTronDeposits() {
    const users = await User.find();

    for (const user of users) {
        user.assets.forEach(asset => {
            if ((asset.currency === "tron") && asset.depositAddress) {
                console.log("asset.depositAddress", asset.depositAddress)
                watchTronAddressDeposit(asset.depositAddress);
            }
        }); 
    }
}
   
// Set an interval to call watchAllTronDeposits every 5 seconds
const testF = () => {
    setInterval(() => {
      watchAllTrxDeposits();
    }, 50000);
};
const testF2 = () => {
    setInterval(() => {
      watchAllTronDeposits(); 
    }, 5000);
};
// testF()
// testF2(); 

//////handke confirm transaction here
export const processPendingTrxTransactions = async () => {
    try {
      const pendingTransactions = await TransactionHistory.find({ status: 'pending', type: 'Crypto deposit' });
  
      for (const tx of pendingTransactions) {

        if(tx.currency === "tether" || tx.currency === "tron") {

            const { transactionInfo } = await checkTransactionStatus(tx.trxId);
            console.log("....trxInfo......111",transactionInfo)
            if(!transactionInfo?.id || !transactionInfo?.blockNumber) {
                console.log(`Transaction ${tx.trxId} is not yet confirmed`)
                return;
            } else {
                if (transactionInfo) {
                    const user = await User.findById(tx.userId);
            
                    if (user) {
                      const asset = user.assets.find(asset => asset.currency === tx.currency);
            
                      if (asset && asset.depositAddress) {
                        asset.balance += Number(tx.amount); 
            
                        asset.asseUsdtWorth = asset.balance * asset.usdValue;
                        asset.assetNairaWorth = asset.balance * asset.nairaValue;
                    
                        user.totalUsdValue = user.assets.reduce((total, asset) => total + (asset.asseUsdtWorth || 0), 0);
                        user.totalNairaValue = user.assets.reduce((total, asset) => total + (asset.assetNairaWorth || 0), 0);
                        await user.save();
            
                        tx.status = 'confirmed';
                        tx.blockNumber = transactionInfo.blockNumber;
            
                        await tx.save();
            
                          const emailContent = messages.cryptoDepositConfirmedEmail(user.username, tx.amount, asset.currency, tx.trxId);
                          activitiesEmail(user.email, messages.cryptoDepositConfirmedSubject, emailContent);
            
                        console.log(`Transaction ${tx.trxId} confirmed. User ${user.username}'s ${asset.currency} balance updated.`);
                        console.log("....trxInfo......2222",transactionInfo)
                        // Sweep the balance immediately after crediting 
                        const hotWalletUser = await User.findOne({ username: 'Ekzahot', role: 'admin' });
                        const hotWalletAddress = hotWalletUser?.assets.find(a => a.currency === tx.currency)?.depositAddress;
                        // console.log(hotWalletAddress, ".....hot...wall......et.......")
      
                        if (!hotWalletAddress) {
                            console.error("Hot wallet address not found.");  
                            continue;
                        } 
      
                        const fee = await calculateTransactionFee(hotWalletAddress, asset.depositAddress);
                        const addressBalance = await getAddressBalance(asset.depositAddress, tx.currency === 'tether' ? usdtContractAdd : null);
                        const amountToSweep = Number(addressBalance) - fee.energyFee;
      
                        if (amountToSweep >= 10) { 
                            try {
                                const sweepTx = await sendTrx(
                                    asset.depositAddress,
                                    hotWalletAddress,
                                    amountToSweep,
                                    asset.privateKey, 
                                    asset.currency   
                                ); 
      
                                // Log the sweep transaction, no need to update the user's balance
                                await SweptTransaction.create({
                                    userId: user._id,
                                    amountSwept: amountToSweep,
                                    txId: asset.currency === "tether" ? sweepTx : sweepTx.txid,
                                    timestamp: new Date(), 
                                }); 
      
                                console.log(`User ${user.username}'s ${asset.currency} balance of ${amountToSweep} swept to hot wallet. Transaction: ${sweepTx.txid}`);
                            } catch (error) {
                                console.error(`Failed to sweep ${tx.currency} for user ${user.username}:`, error);
                            }
                        } else {
                            console.log(`Insufficient sweepable ${tx.currency} amount (${amountToSweep}) for user ${user.username}. balance is ${addressBalance}`);
                        }
      
                      } else {
                        console.error(`User ${user.username} does not have a BTC deposit address. Skipping transaction ${tx.trxId}.`);
                      }
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

  const testF3 = () => {
    setInterval(() => {
        processPendingTrxTransactions();
    }, 10000);
};

// testF3()