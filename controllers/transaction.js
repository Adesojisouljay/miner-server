import transactionHistory from '../models/transactionHistory.js';
import User from '../models/Users.js';
import Profit from '../models/Profits.js';
import TransactionHistory from '../models/transactionHistory.js';

const FEE_PERCENTAGE = 2;

const calculateFee = (amount) => {
  return amount * (FEE_PERCENTAGE / 100);
};

// Helper functions to generate transaction IDs and block numbers
function generateTransactionId() {
  return `trx-${new Date().getTime()}`;
}

function generateBlockNumber() {
  return `block-${new Date().getTime()}`;
}

export const getUserTransactions = async (req, res) => {
    try {
        const userId = req.user.userId;
    
        const transactionH = await transactionHistory.find({ userId });
    
        if (!transactionH) {
          return res.status(404).json({ success: false, message: 'transaction record not found' });
        }
    
        res.status(200).json({ success: true, transactionH });
      } catch (error) {
        console.error('Error retrieving user mining record:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
    
  };

  export const getAllTransactions = async (req, res) => {
    try {
      const transactionH = await transactionHistory.find();
  
      if (!transactionH || transactionH.length === 0) {
        return res.status(404).json({ success: false, message: 'Transaction records not found' });
      }
  
      res.status(200).json({ success: true, transactionH });
    } catch (error) {
      console.error('Error retrieving transaction records:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };
  
  export const buyAsset = async (req, res) => {
    try {
      const { currency, amount } = req.body;
      const userId = req.user.userId;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      const userAsset = user.assets.find(asset => asset.currency === currency);
  
      if (!userAsset) {
        return res.status(400).json({ success: false, message: 'Invalid asset type' });
      }
  
      const fee = calculateFee(amount);
      const amountAfterFee = amount - fee;
      const assetBalance = amountAfterFee / userAsset.nairaValue;
  
      userAsset.balance += assetBalance;
      userAsset.asseUsdtWorth = userAsset.balance * userAsset.usdValue;
      userAsset.assetNairaWorth = userAsset.balance * userAsset.nairaValue;
  
      user.totalUsdValue = user.assets.reduce((total, asset) => total + asset.asseUsdtWorth, 0);
      user.totalNairaValue = user.assets.reduce((total, asset) => total + asset.assetNairaWorth, 0);
  
      // Deduct Naira balance
      user.nairaBalance -= amount;
  
      await user.save();
  
      // Record transaction
      const transaction = await TransactionHistory.create({
        userId,
        sender: 'N/A',
        receiver: userId.toString(),
        memo: 'Purchase asset',
        trxId: generateTransactionId(),
        blockNumber: generateBlockNumber(),
        amount: amount.toString(),
        currency,
        type: 'buy',
        bankDetails: {},
      });
  
      // Record profit
      await Profit.create({
        userId,
        currency,
        amount,
        fee,
        transactionType: 'buy',
        transactionId: transaction._id,
      });
  
      res.status(200).json({ success: true, message: `${amount} ${currency} purchased successfully`, transaction });
    } catch (error) {
      console.error('Error buying asset:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };
  
  export const sellAsset = async (req, res) => {
    try {
      const { currency, amount } = req.body;
      const userId = req.user.userId;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      const userAsset = user.assets.find(asset => asset.currency === currency);
  
      if (!userAsset || userAsset.balance < amount) {
        return res.status(400).json({ success: false, message: 'Insufficient balance' });
      }
  
      const fee = calculateFee(amount);
      const amountAfterFee = amount - fee;
      const usdValue = amountAfterFee * userAsset.usdValue;
      const nairaValue = amountAfterFee * userAsset.nairaValue;
  
      userAsset.balance -= amount;
      userAsset.asseUsdtWorth = userAsset.balance * userAsset.usdValue;
      userAsset.assetNairaWorth = userAsset.balance * userAsset.nairaValue;
  
      user.totalUsdValue = user.assets.reduce((total, asset) => total + asset.asseUsdtWorth, 0);
      user.totalNairaValue = user.assets.reduce((total, asset) => total + asset.assetNairaWorth, 0);
  
      // Add Naira balance
      user.nairaBalance += nairaValue;
  
      await user.save();
  
      // Record transaction
      const transaction = await TransactionHistory.create({
        userId,
        sender: userId.toString(),
        receiver: 'N/A',
        memo: 'Sell asset',
        trxId: generateTransactionId(),
        blockNumber: generateBlockNumber(),
        amount: amount.toString(),
        currency,
        type: 'sell',
        bankDetails: {},
      });
  
      // Record profit
      await Profit.create({
        userId,
        currency,
        amount,
        fee,
        transactionType: 'sell',
        transactionId: transaction._id,
      });
  
      res.status(200).json({ success: true, message: `${amount} ${currency} sold successfully`, transaction });
    } catch (error) {
      console.error('Error selling asset:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };
