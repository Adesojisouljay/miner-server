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

    const transactionH = await transactionHistory.find({ 
      $or: [{ userId }, { receiverId: userId }] 
    });

    if (transactionH.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction record not found' });
    }

    res.status(200).json({ success: true, transactionH });
  } catch (error) {
    console.error('Error retrieving user transaction record:', error);
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
      const { currency, amount, amountType } = req.body;
      const userId = req.user.userId;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      const userAsset = user.assets.find(asset => asset.currency === currency);
  
      if (!userAsset) {
        return res.status(400).json({ success: false, message: 'Invalid asset type' });
      }
  
      let nairaAmount;
      if (amountType === 'fiat') {
        nairaAmount = amount;
      } else if (amountType === 'crypto') {
        nairaAmount = amount * userAsset.nairaValue;
      }
  
      if (nairaAmount < 500) {
        return res.status(400).json({ success: false, message: 'Amount must be at least 500 Naira' });
      }
  
      if (user.nairaBalance < nairaAmount) {
        return res.status(400).json({ success: false, message: 'Insufficient Naira balance' });
      }
  
      const fee = calculateFee(nairaAmount);
      const amountAfterFee = nairaAmount - fee;
      const assetBalance = amountAfterFee / userAsset.nairaValue;
  
      userAsset.balance += assetBalance;
      userAsset.asseUsdtWorth = userAsset.balance * userAsset.usdValue;
      userAsset.assetNairaWorth = userAsset.balance * userAsset.nairaValue;
  
      user.totalUsdValue = user.assets.reduce((total, asset) => total + asset.asseUsdtWorth, 0);
      user.totalNairaValue = user.assets.reduce((total, asset) => total + asset.assetNairaWorth, 0);
  
      user.nairaBalance -= nairaAmount;
  
      await user.save();
  
      const transaction = await TransactionHistory.create({
        userId,
        sender: 'N/A',
        receiver: userId.toString(),
        memo: 'Purchase asset',
        trxId: generateTransactionId(),
        blockNumber: generateBlockNumber(),
        amount: nairaAmount,
        currency,
        type: 'buy',
        bankDetails: {},
      });
  
      await Profit.create({
        userId,
        currency,
        amount: nairaAmount,
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
        const { currency, amount, amountType } = req.body;
        const userId = req.user.userId;
        const user = await User.findById(userId);
        console.log(amount)
    
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const userAsset = user.assets.find(asset => asset.currency === currency);
    
        if (!userAsset || userAsset.balance < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }

        let nairaAmount;
        if (amountType === 'fiat') {
            nairaAmount = amount * userAsset.nairaValue;
        } else if (amountType === 'crypto') {
          nairaAmount = Number(amount) * userAsset.nairaValue;
        }
        console.log(nairaAmount)

        if (Number(nairaAmount) < 500) {
            return res.status(400).json({ success: false, message: 'Cannot sell below 500 Naira' });
        }

        const fee = calculateFee(nairaAmount);
        const amountAfterFee = nairaAmount - fee;

        const cryptoAmountAfterFee = amountAfterFee / userAsset.nairaValue;

        userAsset.balance -= amount;
        userAsset.asseUsdtWorth = userAsset.balance * userAsset.usdValue;
        userAsset.assetNairaWorth = userAsset.balance * userAsset.nairaValue;
    
        user.totalUsdValue = user.assets.reduce((total, asset) => total + asset.asseUsdtWorth, 0);
        user.totalNairaValue = user.assets.reduce((total, asset) => total + asset.assetNairaWorth, 0);
    
        user.nairaBalance += amountAfterFee;

        await user.save();
    
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
    
        await Profit.create({
            userId,
            currency,
            amount: nairaAmount,
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

  export const calculateTransaction = async (req, res) => {
    try {
      const { amount, currency, amountType, transactionType } = req.query;
      const userId = req.user.userId;
  
      if (!amount || !currency || !amountType || !transactionType) {
        return res.status(400).json({ success: false, message: 'Invalid input data' });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      const asset = user.assets.find(a => a.currency === currency);
      if (!asset) {
        return res.status(404).json({ success: false, message: 'Asset not found' });
      }
  
      let convertedNairaAmount
      let convertedCryptoAmount;
      let cryptoAmount;
      let fiatFee;
      let cryptoFee;
      let fiatAmountAfterFee;
      let cryptoAmountAfterFee;
      if (amountType === 'fiat') {
        convertedNairaAmount = amount
        convertedCryptoAmount = amount / asset.nairaValue;
        cryptoAmount = convertedCryptoAmount;
        fiatFee = calculateFee(amount);
        cryptoFee = fiatFee / asset.nairaValue;
        fiatAmountAfterFee = amount - fiatFee;
        cryptoAmountAfterFee = fiatAmountAfterFee / asset.nairaValue;
      } else if (amountType === 'crypto') {
        convertedCryptoAmount = amount
        convertedNairaAmount = amount * asset.nairaValue;
        cryptoAmount = amount;
        cryptoFee = calculateFee(amount);
        fiatFee = cryptoFee * asset.nairaValue;
        cryptoAmountAfterFee = cryptoAmount - cryptoFee;
        fiatAmountAfterFee = cryptoAmountAfterFee * asset.nairaValue;
      }
            
      const roundedConvertedCryptoAmount = parseFloat(Number(convertedCryptoAmount).toFixed(3));
      const roundedConvertedNairaAmount = parseFloat(Number(convertedNairaAmount).toFixed(3));
      const roundedCryptoAmount = parseFloat(Number(cryptoAmount).toFixed(3));
      const roundedFiatFee = parseFloat(fiatFee.toFixed(3));
      const roundedCryptoFee = parseFloat(cryptoFee.toFixed(3));
      const roundedFiatAmountAfterFee = parseFloat(fiatAmountAfterFee.toFixed(3));
      const roundedCryptoAmountAfterFee = parseFloat(cryptoAmountAfterFee.toFixed(3));
  
      res.status(200).json({
        success: true,
        convertedCryptoAmount: roundedConvertedCryptoAmount + " " + currency.toUpperCase(),
        convertedNairaAmount: roundedConvertedNairaAmount + " Naira",
        cryptoAmount: roundedCryptoAmount + " " + currency.toUpperCase(),
        fiatFee: roundedFiatFee + " Naira",
        cryptoFee: roundedCryptoFee + currency.toUpperCase(),
        fiatAmountAfterFee: roundedFiatAmountAfterFee + " Naira",
        cryptoAmountAfterFee: roundedCryptoAmountAfterFee + " " + currency.toUpperCase(),
        assetDetails: {
          coinId: asset.coinId,
          symbol: asset.symbol,
          image: asset.image,
          balance: asset.balance,
        },
      });
    } catch (error) {
      console.error('Error calculating transaction:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };   

 export const fiatTransfer = async (req, res) => {
    try {
      const { receiverIdentifier, amount } = req.body;
      const senderId = req.user.userId;
  
      const sender = await User.findById(senderId);
  
      if (!sender) {
        return res.status(404).json({ success: false, message: 'Sender not found' });
      }
  
      const receiver = await User.findOne({
        $or: [{ email: receiverIdentifier }, { username: receiverIdentifier }],
      });
  
      if (!receiver) {
        return res.status(404).json({ success: false, message: 'Receiver not found' });
      }
  
      if (sender._id.equals(receiver._id)) {
        return res.status(400).json({ success: false, message: 'Sender and receiver cannot be the same' });
      }
  
      if (sender.nairaBalance < amount) {
        return res.status(400).json({ success: false, message: 'Insufficient balance' });
      }
  
      sender.nairaBalance -= amount;
      receiver.nairaBalance += amount;
  
      await sender.save();
      await receiver.save();
  
      const Transaction = await TransactionHistory.create({
        userId: sender._id,
        receiverId: receiver._id,
        sender: sender.username,
        receiver: receiver.username,
        memo: 'Transfer Naira balance',
        trxId: generateTransactionId(),
        blockNumber: generateBlockNumber(),
        amount: amount.toString(),
        currency: 'NGN',
        type: 'transfer',
        bankDetails: {},
      });
  
      res.status(200).json({ success: true, message: `Transferred ${amount} Naira successfully`, Transaction });
    } catch (error) {
      console.error('Error transferring Naira balance:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };
  