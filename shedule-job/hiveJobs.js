// import cron from 'node-cron';
// import mongoose from 'mongoose';
// import User from '../models/Users.js';
// import ProcessedTrx from '../models/ProcessedTrx.js';
// import TransactionHistory from '../models/transactionHistory.js'; // Import the TransactionHistory model
// import { getAccountHistory } from '../utils/hive.js';
// import fetchCryptoPrices from '../utils/coingecko.js';

// let isProcessing = false; // To prevent overlapping executions

// const watchHiveTransaction = cron.schedule('*/5 * * * * *', async () => {
//     if (isProcessing) return; // Prevent overlapping executions
//     // fetchCryptoPrices();

//     isProcessing = true;
//     try {
//         const latestProcessedTrx = await ProcessedTrx.findOne().sort({ _id: -1 }).exec();
//         const startFromIndex = latestProcessedTrx ? latestProcessedTrx.index : -1;

//         const accountHistory = await getAccountHistory('souljay', startFromIndex, 1000);

//         const transferTransactions = accountHistory
//             .filter(([index, transaction]) => transaction.op[0] === 'transfer')
//             .map(([index, transaction]) => ({
//                 index,
//                 trx_id: transaction.trx_id,
//                 op: transaction.op[1],
//             }));

//         for (let i = transferTransactions.length - 1; i >= 0; i--) {
//             const { index, op, trx_id } = transferTransactions[i];
//             const { from, to, amount, memo } = op;

//             const [amountValue, currency] = amount.split(' ');

//             try {
//                 // Check if transaction with this trx_id has already been processed
//                 const processedTrx = await ProcessedTrx.findOne({ trxId: trx_id });
//                 if (processedTrx) {
//                     // console.log(`Transaction ${trx_id} already processed, skipping.`);
//                     continue;
//                 }

//                 // Save the transaction history regardless of memo
//                 if (to === 'souljay') {
//                     const existingTransactionHistory = await TransactionHistory.findOne({ trxId: trx_id });
//                     if (!existingTransactionHistory) {
//                         const newTransactionHistory = new TransactionHistory({
//                             sender: from,
//                             receiver: to,
//                             memo: memo || '',
//                             trxId: trx_id,
//                             amount: amountValue,
//                             currency,
//                             type: 'deposit', // Transaction type
//                         });

//                         await newTransactionHistory.save();
//                         console.log(`Transaction history for ${trx_id} saved.`);
//                     } else {
//                         // console.log(`Transaction history for ${trx_id} already exists, skipping.`);
//                     }
//                 }

//                 // Process the transaction if it has a valid memo
//                 if (to === 'souljay' && memo) {
//                     const userId = mongoose.Types.ObjectId.isValid(memo.trim()) ? memo.trim() : null;

//                     if (!userId) {
//                         // console.warn(`Invalid memo format for user ID: ${memo}`);
//                         continue;
//                     }

//                     const user = await User.findById(userId);

//                     if (user) {
//                         if (user.hiveBalance === undefined) user.hiveBalance = 0;
//                         if (user.hbdBalance === undefined) user.hbdBalance = 0;
//                         if (user.nairaBalance === undefined) user.nairaBalance = 0;
//                         if (user.totalBalance === undefined) user.totalBalance = 0;

//                         if (currency === 'HIVE') {
//                             user.hiveBalance += parseFloat(amountValue);
//                         } else if (currency === 'HBD') {
//                             user.hbdBalance += parseFloat(amountValue);
//                         }

//                         user.totalBalance = user.hiveBalance + user.hbdBalance + user.nairaBalance;

//                         await user.save();
//                         // console.log(`Updated balance for user ${user._id}`);
//                     } else {
//                         // console.warn(`No user found with ID: ${userId}`);
//                     }
//                 }

//                 const newProcessedTrx = new ProcessedTrx({ trxId: trx_id, index });
//                 await newProcessedTrx.save();
//                 // console.log(`Processed transaction ${trx_id} saved.`);
//             } catch (error) {
//                 // console.error(`Error processing transaction for memo: ${memo}`, error);
//             }
//         }

//     } catch (error) {
//         console.error('Error checking deposits:', error);
//     } finally {
//         isProcessing = false;
//     }
// });

// export default watchHiveTransaction;
