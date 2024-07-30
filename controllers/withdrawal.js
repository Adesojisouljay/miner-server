import User from '../models/Users.js';
import Withdrawal from '../models/Withdrawal.js';
import Mining from '../models/Mining.js'; // Assuming you have a Mining model
import { transferOp } from '../hive/operations.js';
import { getWithdrawalDetails } from '../hive/operations.js';
import TransactionHistory from '../models/transactionHistory.js';

const acc = process.env.HIVE_ACC
 
//HIVE LOGICS
export const processHiveWithdrawal = async (req, res) => {
  const { to, amount, currency, memo } = req.body;
  const userId = req.user.userId;

  if (!to || !amount || !currency) {
    return res.status(400).json({ success: false, message: 'Recipient account, amount, and currency are required' });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find asset in the user's assets
    const asset = user.assets.find(asset => asset.currency.toLowerCase() === currency.toLowerCase());

    if (!asset) {
      return res.status(400).json({ success: false, message: `No asset found for currency: ${currency}` });
    }

    if (asset.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Perform transfer
    const result = await transferOp(to, `${amount} ${currency.toUpperCase()}`, memo || '');
    // console.log(result)

    const { id: trxId} = result;
    console.log(trxId)

     // Fetch transaction details to get the block number
     const transactionDetails = await getWithdrawalDetails(trxId);

     if(transactionDetails) {

        const { block_num: blockNumber } = transactionDetails;
    
      console.log(transactionDetails)

      // Log transaction history
      const transactionHistory = new TransactionHistory({
          userId,
          sender: acc,
          receiver: to,
          memo,
          trxId,
          blockNumber,
          amount,
          currency: currency,
          type: 'withdrawal',
          bankDetails: {}
        });
    
        await transactionHistory.save();
        console.log('Transaction history updated successfully.');
     }

    // Update user's balance
    asset.balance -= amount;
    asset.assetWorth = asset.balance * asset.usdValue;
    //we should calculate totalValue here too
    await user.save();

    return res.status(200).json({ success: true, message: 'Withdrawal successful', result });
  } catch (error) {
    console.error('Error processing withdrawal:', error.message);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

export const initiateWithdrawal = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.userId;

    const withdrawal = new Withdrawal({
      userId: userId,
      amount: amount,
      status: 'Pending'
    });
    await withdrawal.save();

    res.status(200).json({ success: true, message: 'Withdrawal request initiated', withdrawal });
  } catch (error) {
    console.error('Error initiating withdrawal:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const confirmWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params;

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No user token provided' });
    }

    const user = await User.findById(req.user.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: 'Forbidden: User is not an admin' });
    }

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    withdrawal.status = 'Confirmed';
    await withdrawal.save();

    const withdrawUser = await User.findById(withdrawal.userId);
    if (!withdrawUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    withdrawUser.balance -= withdrawal.amount; 
    await withdrawUser.save();

    const APR = 0.15; // 15% APR
    const newMiningRate = (withdrawUser.balance * APR) / (365 * 24 * 60 * 60 * 100);
    let mining = await Mining.findOne({ userId: withdrawUser._id });
    if (!mining) {
      mining = new Mining({
        userId: withdrawUser._id,
        miningRate: newMiningRate,
      });
    } else {
      mining.miningRate = newMiningRate;
    }
    await mining.save();

    res.status(200).json({ success: true, message: 'Withdrawal confirmed and finalized', withdrawal });
  } catch (error) {
    console.error('Error confirming withdrawal:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find();
    console.log(withdrawals)
    res.status(200).json({ success: true, withdrawals });
  } catch (error) {
    console.error('Error getting withdrawals:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const cancelWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params;

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No user token provided' });
    }

    const user = await User.findById(req.user.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: 'Forbidden: User is not an admin' });
    }

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    if (withdrawal.status === 'Confirmed') {
      return res.status(400).json({ success: false, message: 'Withdrawal has already been confirmed' });
    }

    withdrawal.status = 'Canceled';
    await withdrawal.save();

    res.status(200).json({ success: true, message: 'Withdrawal canceled successfully', withdrawal });
  } catch (error) {
    console.error('Error canceling withdrawal:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

