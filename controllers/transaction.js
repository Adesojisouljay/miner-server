import transactionHistory from '../models/transactionHistory.js';
import User from '../models/Users.js';
import Profit from '../models/Profits.js';
import TransactionHistory from '../models/transactionHistory.js';
import CryptoData from '../models/CryptoData.js';
import { takeTransactionFee } from '../utils/admin.js';

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
      console.log(amount)
  
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

      // const feeInNaira = calculateFee(nairaAmount);
      
      const fee = calculateFee(nairaAmount); /////naira fee
      const feeInCrypto = fee / userAsset.nairaValue;
      const cryptoAmount = amount / userAsset.nairaValue
      const amountAfterFee = nairaAmount - fee;
      const assetBalance = amountAfterFee / userAsset.nairaValue;
  
      userAsset.balance += assetBalance;
      userAsset.asseUsdtWorth = userAsset.balance * userAsset.usdValue;
      userAsset.assetNairaWorth = userAsset.balance * userAsset.nairaValue;
  
      user.totalUsdValue = user.assets.reduce((total, asset) => total + asset.asseUsdtWorth, 0);
      user.totalNairaValue = user.assets.reduce((total, asset) => total + asset.assetNairaWorth, 0);
  
      user.nairaBalance -= nairaAmount;
      await takeTransactionFee(feeInCrypto, currency);
  
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
        nairaAmount,
        cryptoAmount: amountType === "fiat" ? cryptoAmount : amount,
        nairaFee: fee,
        cryptoFee: feeInCrypto,
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
        console.log("nairaAmount", nairaAmount)

        if (Number(nairaAmount) < 500) {
            return res.status(400).json({ success: false, message: 'Cannot sell below 500 Naira' });
        }

        const fee = calculateFee(nairaAmount);
        const feeInCrypto = fee / userAsset.nairaValue;
        const amountAfterFee = nairaAmount - fee;

        const cryptoAmountAfterFee = amountAfterFee / userAsset.nairaValue;

        userAsset.balance -= amount;
        userAsset.asseUsdtWorth = userAsset.balance * userAsset.usdValue;
        userAsset.assetNairaWorth = userAsset.balance * userAsset.nairaValue;
    
        user.totalUsdValue = user.assets.reduce((total, asset) => total + asset.asseUsdtWorth, 0);
        user.totalNairaValue = user.assets.reduce((total, asset) => total + asset.assetNairaWorth, 0);
    
        user.nairaBalance += amountAfterFee;
        await takeTransactionFee(feeInCrypto, currency);

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
            nairaAmount,
            cryptoAmount: amount,
            nairaFee: fee,
            cryptoFee: feeInCrypto,
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
  
  export const getConversionRate = async (req, res) => {
    try {
      const { fromCurrency, toCurrency, amount } = req.body;
      console.log({ fromCurrency, toCurrency, amount });
  
      if (!fromCurrency || !toCurrency || !amount) {
        return res.status(400).json({ success: false, message: 'Some parameters are missing' });
      }
  
      const cryptoData = await CryptoData.findOne({});
  
      if (!cryptoData || !cryptoData.usdData) {
        return res.status(400).json({ success: false, message: 'Crypto data not found' });
      }
  
      const fromCurrencyData = cryptoData.usdData.find(currency => currency.symbol === fromCurrency.toLowerCase());
      const toCurrencyData = cryptoData.usdData.find(currency => currency.symbol === toCurrency.toLowerCase());
  
      if (!fromCurrencyData || !toCurrencyData) {
        return res.status(400).json({ success: false, message: 'Invalid currency provided' });
      }
  
      const conversionRate = fromCurrencyData.current_price / toCurrencyData.current_price;
      const convertedAmount = conversionRate * amount;
  
      const fee = calculateFee(convertedAmount);
      const amountAfterFee = convertedAmount - fee;
  
      const roundedConvertedAmount = parseFloat(amountAfterFee.toFixed(6));
  
      res.status(200).json({
        success: true,
        fromCurrency,
        toCurrency,
        amount,
        conversionRate,
        convertedAmount: roundedConvertedAmount,
        fee,
        message: `You will receive ${roundedConvertedAmount} ${toCurrency} after a ${FEE_PERCENTAGE}% fee.`,
      });
    } catch (error) {
      console.error('Error fetching conversion rate:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };

  export const swapAsset = async (req, res) => {
    console.log(req.user);
    try {
      const { fromCurrency, toCurrency, fromAmount } = req.body;
      const userId = req.user.userId;
      const user = await User.findById(userId);
  
      if (!fromCurrency || !toCurrency || !fromAmount) {
        return res.status(400).json({ success: false, message: 'Some parameters are missing' });
      }
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      const fromAsset = user.assets.find(asset => asset.symbol === fromCurrency);
      const toAsset = user.assets.find(asset => asset.symbol === toCurrency);
  
      if (!fromAsset || !toAsset) {
        return res.status(400).json({ success: false, message: 'Invalid asset types' });
      }
  
      if (fromAsset.balance < fromAmount) {
        return res.status(400).json({ success: false, message: `Insufficient ${fromCurrency} balance` });
      }
  
      const fee = calculateFee(fromAmount);
      const fromAmountAfterFee = fromAmount - fee;
  
      const cryptoData = await CryptoData.findOne({});
  
      const fromCurrencyData = cryptoData.usdData.find(data => data.symbol === fromCurrency);
      const toCurrencyData = cryptoData.usdData.find(data => data.symbol === toCurrency);
  
      if (!fromCurrencyData || !toCurrencyData) {
        return res.status(400).json({ success: false, message: 'Crypto data not found' });
      }
  
      const conversionRate = fromCurrencyData.current_price / toCurrencyData.current_price;
      const toAmount = conversionRate * fromAmountAfterFee;
  
      fromAsset.balance -= fromAmount;
      toAsset.balance += toAmount;
  
      user.totalUsdValue = user.assets.reduce((total, asset) => total + (asset.balance * asset.usdValue), 0);
      user.totalNairaValue = user.assets.reduce((total, asset) => total + (asset.balance * asset.nairaValue), 0);
  
      await user.save();
  
      const transaction = await TransactionHistory.create({
        userId,
        sender: userId.toString(),
        receiver: userId.toString(),
        trxId: generateTransactionId(),
        blockNumber: generateBlockNumber(),
        fromAmount: fromAmount.toFixed(2),
        fromCurrency,
        toAmount: toAmount.toFixed(2),
        toCurrency,
        amount: fromAmountAfterFee.toFixed(2),
        currency: fromCurrency,
        type: 'swap',
        bankDetails: {},
      });
  
      await Profit.create({
        userId,
        currency: fromCurrency,
        amount: fromAmount,
        fee,
        transactionType: 'swap',
        transactionId: transaction._id,
      });
  
      res.status(200).json({
        success: true,
        message: `Successfully swapped ${fromAmountAfterFee.toFixed(2)} ${fromCurrency} (after ${fee.toFixed(2)} fee) to ${toAmount.toFixed(2)} ${toCurrency}`,
        transaction,
      });
    } catch (error) {
      console.error('Error swapping asset:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };
  