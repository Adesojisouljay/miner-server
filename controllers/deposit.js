import Deposit from '../models/Deposit.js';
import User from '../models/Users.js';
import Mining from '../models/Mining.js';
import Merchant from '../models/Merchant.js';
import NairaDepositRequest from '../models/FiatDeposit.js';
import TransactionHistory from '../models/transactionHistory.js';

////////FIAT DEPOSIT LOGICS
export const createNairaDepositRequest = async (req, res) => {
  try {
    const { amount, narration, merchantId } = req.body;
    const userId = req.user.userId;

    const merchant = await Merchant.findOne({ _id: merchantId, status: 'approved', isActive: true });
    if (!merchant) {
      return res.status(404).json({ success: false, message: 'Merchant not found or not approved/active' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newNairaDepositRequest = new NairaDepositRequest({
      userId,
      merchantId,
      amount,
      narration
    });

    await newNairaDepositRequest.save();
    res.status(201).json({
      success: true,
      message: 'Naira deposit request created successfully',
      data: {
        depositRequest: newNairaDepositRequest,
        userUsername: user.username,  
        merchantUsername: merchant.nickname 
      }
    });
  } catch (error) {
    console.error('Error creating Naira deposit request:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};


export const confirmNairaDepositRequest = async (req, res) => {
  try {
    const { depositRequestId, sender, receiver, accountNumber, accountHolderName, bankName } = req.body;

    const depositRequest = await NairaDepositRequest.findById(depositRequestId);
    if (!depositRequest) {
      return res.status(404).json({ success: false, message: 'Deposit request not found' });
    }

    const existingTransaction = await TransactionHistory.findOne({ trxId: depositRequestId });
    if (existingTransaction) {
      return res.status(400).json({ success: false, message: 'Transaction has already been processed' });
    }

    const newTransactionHistory = new TransactionHistory({ 
      userId: depositRequest.userId,
      sender,
      receiver,
      memo: depositRequest.narration,
      trxId: depositRequestId,
      blockNumber: "deposit" + Date.now(),
      amount: depositRequest.amount,
      currency: "NGN",
      type: "Naira deposit",
      bankDetails: {
        accountNumber,
        bankName,
        accountHolderName
      }
    });

    await newTransactionHistory.save();

    depositRequest.status = 'completed';
    await depositRequest.save();

    const user = await User.findById(depositRequest.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.nairaBalance += depositRequest.amount;
    await user.save();

    res.status(200).json({ success: true, message: 'Naira deposit confirmed and balance updated', data: depositRequest });
  } catch (error) {
    console.error('Error confirming Naira deposit request:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const cancelNairaDepositRequest = async (req, res) => {
  try {
    const { depositRequestId } = req.body;

    const depositRequest = await NairaDepositRequest.findById(depositRequestId);
    if (!depositRequest) {
      return res.status(404).json({ success: false, message: 'Deposit request not found' });
    }

    const existingCancellation = await TransactionHistory.findOne({ trxId: depositRequestId });
    if (existingCancellation) {
      return res.status(400).json({ success: false, message: 'This transaction was canceled' });
    }

    const newTransactionHistory = new TransactionHistory({
      userId: depositRequest.userId,
      sender: "Not provided",
      receiver: "Not found",
      memo: "Not found",
      trxId: depositRequestId,
      blockNumber: "cancel" + Date.now(),
      amount: "Not found",
      currency: "NGN",
      type: "Naira deposit cancel",
      bankDetails: {
        accountNumber: "Not found",
        bankName: "Not found",
        accountHolderName: "Not found"
      }
    });

    await newTransactionHistory.save();

    depositRequest.status = 'failed';
    depositRequest.transactionId = newTransactionHistory._id;
    await depositRequest.save();

    res.status(200).json({ success: true, message: 'Naira deposit cancelled', data: depositRequest });
  } catch (error) {
    console.error('Error cancelling Naira deposit request:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};







///be removed//////////////
export const deposit = async (req, res) => {
  try {
    const { walletAddress, amount } = req.body;
    console.log("test log",walletAddress, amount)

    const deposit = new Deposit({
      user: req.user.userId,
      walletAddress,
      amount,
      status: 'Pending'
    });

    await deposit.save();

    res.status(201).json({ success: true, message: 'Deposit request initiated successfully' });
  } catch (error) {
    console.error('Error initiating deposit request:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const getAllDeposits = async (req, res) => {
  try {

    const deposits = await Deposit.find();

    res.status(200).json({ success: true, deposits });
  } catch (error) {
    console.error('Error fetching deposits:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const confirmDeposit = async (req, res) => {
  try {
    const { depositId } = req.params;

    const deposit = await Deposit.findById(depositId);
    if (!deposit) {
      return res.status(404).json({ success: false, message: 'Deposit not found' });
    }

    deposit.status = 'Confirmed';
    await deposit.save();

    const user = await User.findById(deposit.user);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.balance = +(user.balance + deposit.amount).toFixed(3);
    await user.save();

    const APR = 0.15;
    let newMiningRate = +(user.balance * APR / (365 * 24 * 60 * 60 * 100));
    console.log('User Balance:', user.balance);
    console.log('New Mining Rate:',typeof newMiningRate);
    console.log('New Mining Rate:', newMiningRate.toFixed(3));

    let mining = await Mining.findOne({ userId: user._id });
    if (!mining) {
      mining = new Mining({
        userId: user._id,
        miningRate: newMiningRate,
      });
    } else {

      mining.miningRate = newMiningRate;
    }
    await mining.save();

    res.status(200).json({ success: true, message: 'Deposit confirmed and user balance updated', deposit });
  } catch (error) {
    console.error('Error confirming deposit:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const cancelDeposit = async (req, res) => {
  try {
    const depositId = req.params.depositId;

    const deposit = await Deposit.findById(depositId);
    if (!deposit) {
      return res.status(404).json({ success: false, message: 'Deposit request not found' });
    }

    deposit.status = 'Canceled';
    await deposit.save();

    res.status(200).json({ success: true, message: 'Deposit request canceled successfully' });
  } catch (error) {
    console.error('Error canceling deposit request:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
