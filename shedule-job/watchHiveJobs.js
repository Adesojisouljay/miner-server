import cron from 'node-cron';
import mongoose from 'mongoose';
import User from '../models/Users.js';
import ProcessedTrx from '../models/ProcessedTrx.js';
import transactionHistory from '../models/transactionHistory.js';
import axios from 'axios';

const HIVE_API_URL = 'https://api.hive.blog';
let lastProcessedBlockNum = 0;

const getBlock = async (blockNum) => {
  try {
    const response = await axios.post(HIVE_API_URL, {
      jsonrpc: '2.0',
      method: 'block_api.get_block',
      params: {
        block_num: blockNum,
      },
      id: 1,
    });

    return response.data.result;
  } catch (error) {
    console.error(`Error getting block ${blockNum}:`, error.message);
  }
};

const getLastBlockNum = async () => {
  try {
    const response = await axios.post(HIVE_API_URL, {
      jsonrpc: '2.0',
      method: 'condenser_api.get_dynamic_global_properties',
      params: [],
      id: 1,
    });
    return response.data.result.head_block_number;
  } catch (error) {
    console.error('Error getting last block number:', error.message);
  }
};

const initLastProcessedBlockNum = async () => {
  try {
    if (lastProcessedBlockNum === 0) {
      lastProcessedBlockNum = await getLastBlockNum();
    }
  } catch (error) {
    console.error('Error initializing last processed block number:', error.message);
  }
};

const mapNaiToCurrency = (nai) => {
  switch (nai) {
    case '@@000000021':
      return 'HIVE';
    case '@@000000013':
      return 'HBD';
    default:
      return null;
  }
};

const watchHiveBlocks = cron.schedule('*/0.1 * * * * *', async () => {
  try {
    await initLastProcessedBlockNum();
    const currentBlockNum = await getLastBlockNum();

    for (let blockNum = lastProcessedBlockNum + 1; blockNum <= currentBlockNum; blockNum++) {
      const block = await getBlock(blockNum);

      // Map transaction IDs to transactions
      const transactionIdMap = {};
      block.block.transactions.forEach((transaction, index) => {
        transactionIdMap[block.block.transaction_ids[index]] = transaction;
      });

      // Process each transaction using the transaction ID map
      for (const transactionId of block.block.transaction_ids) {
        const transaction = transactionIdMap[transactionId];

        for (const operation of transaction.operations) {
          const { type } = operation;

          if (type === 'transfer_operation' && (operation.value.to === 'souljay' && operation.value.memo)) {
            console.log("Transfer to souljay detected");

            const session = await mongoose.startSession();
            session.startTransaction();

            try {
              const userId = mongoose.Types.ObjectId.isValid(operation.value.memo.trim()) ? operation.value.memo.trim() : null;

              if (!userId) {
                console.warn(`Invalid memo format for user ID: ${operation.value.memo}`);
                continue;
              }

              const processedTrx = await ProcessedTrx.findOne({ trxId: transactionId }).session(session);
              if (processedTrx) {
                console.log(`Transaction ${transactionId} already processed, skipping.`);
                continue;
              }

              const user = await User.findById(userId).session(session);

              if (user) {
                const currency = mapNaiToCurrency(operation.value.amount.nai);
                const amount = parseFloat(operation.value.amount.amount) / Math.pow(10, operation.value.amount.precision);

                let assetFound = false;
                for (let asset of user.assets) {
                  if (asset.currency.toLowerCase() === currency.toLowerCase()) {
                    asset.balance += amount;
                    asset.assetWorth = asset.balance * asset.usdValue;
                    assetFound = true;
                    break;
                  }
                }

                if (!assetFound) {
                  console.warn(`No asset found for currency: ${currency} for user: ${userId}`);
                  await session.abortTransaction();
                  session.endSession();
                  continue;
                }

                user.totalBalance = user.assets.reduce((total, asset) => total + asset.assetWorth, 0);

                await user.save({ session });
                console.log(`Updated balance and asset worth for user ${user._id}`);

                const newTransaction = new transactionHistory({
                  userId: userId,
                  sender: operation.value.from,
                  receiver: operation.value.to,
                  memo: operation.value.memo,
                  trxId: transactionId,
                  blockNumber: currentBlockNum,
                  amount: amount.toString(),
                  currency: currency,
                  type: 'deposit',
                });
                await newTransaction.save({ session });
                console.log(`Transaction ${transactionId} saved in history.`);
              } else {
                console.warn(`No user found with ID: ${userId}`);
              }

              // New processed transaction record with trxId set
              const newProcessedTrx = new ProcessedTrx({ trxId: transactionId });
              await newProcessedTrx.save({ session });
              console.log(`Processed transaction ${transactionId} saved.`);

              await session.commitTransaction();
            } catch (error) {
              await session.abortTransaction();
              console.error(`Error processing transaction for memo: ${operation.value.memo}`, error.message);
            } finally {
              session.endSession();
            }
          }
        }
      }
    }
    // Update last processed block number
    lastProcessedBlockNum = currentBlockNum;
  } catch (error) {
    console.error('Error watching Hive blocks:', error.message);
  }
});

export default watchHiveBlocks;
