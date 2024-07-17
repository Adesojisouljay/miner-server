import cron from 'node-cron';
import mongoose from 'mongoose';
import User from '../models/Users.js';
import ProcessedTrx from '../models/ProcessedTrx.js';
import { getAccountHistory } from '../utils/hive.js';

// Schedule a job to run every 5 seconds
const watchHiveTransaction = cron.schedule('*/5 * * * * *', async () => {
    try {
        // Get the latest transactions
        const accountHistory = await getAccountHistory('souljay', -1, 1000);
        // console.log("accountHistory", accountHistory);

        // Filter and process transactions related to 'transfer'
        const transferTransactions = accountHistory
            .filter(([index, transaction]) => transaction.op[0] === "transfer")
            .map(([index, transaction]) => ({
                trx_id: transaction.trx_id,
                op: transaction.op[1]
            }));
        // console.log("transferTransactions", transferTransactions);

        // Iterate over new transactions from the latest to the oldest
        for (let i = transferTransactions.length - 1; i >= 0; i--) {
            const { op, trx_id } = transferTransactions[i];
            const { from, to, amount, memo } = op;

            // Check if the transaction is to the exchange account and has a memo
            if (to === 'souljay' && memo) {
                try {
                    // Validate the memo as a MongoDB ObjectId
                    const userId = mongoose.Types.ObjectId.isValid(memo.trim()) ? memo.trim() : null;

                    if (!userId) {
                        console.warn(`Invalid memo format for user ID: ${memo}`);
                        continue; // Skip invalid memo format 
                    }

                    // Check if transaction with this trx_id has already been processed
                    const processedTrx = await ProcessedTrx.findOne({ trxId: trx_id });
                    if (processedTrx) {
                        console.log(`Transaction ${trx_id} already processed, skipping.`);
                        return;
                    }

                    // Find user by MongoDB ID
                    const user = await User.findById(userId);

                    if (user) {
                        // Initialize missing fields with default values if necessary
                        if (user.hiveBalance === undefined) user.hiveBalance = 0;
                        if (user.hbdBalance === undefined) user.hbdBalance = 0;
                        if (user.nairaBalance === undefined) user.nairaBalance = 0;
                        if (user.totalBalance === undefined) user.totalBalance = 0;

                        // Determine if the deposit is HIVE or HBD
                        const [amountValue, currency] = amount.split(' ');

                        if (currency === 'HIVE') {
                            user.hiveBalance += parseFloat(amountValue);
                        } else if (currency === 'HBD') {
                            user.hbdBalance += parseFloat(amountValue);
                        }

                        // Optionally, update the total balance (we should calc usd values)
                        user.totalBalance = user.hiveBalance + user.hbdBalance + user.nairaBalance;

                        await user.save();
                        console.log(`Updated balance for user ${user._id}`);
                    } else {
                        console.warn(`No user found with ID: ${userId}`);
                    }

                    // Create new processed transaction record with trxId set
                    const newProcessedTrx = new ProcessedTrx({ trxId: trx_id }); // Ensure trxId is set here
                    await newProcessedTrx.save();
                    console.log(`Processed transaction ${trx_id} saved.`);

                } catch (error) {
                    console.error(`Error processing transaction for memo: ${memo}`, error);
                }
            } else {
                console.warn('Transaction to exchange account without memo or invalid structure:', op);
            }
        }

    } catch (error) {
        console.error('Error checking deposits:', error);
    }
});

export default watchHiveTransaction;
