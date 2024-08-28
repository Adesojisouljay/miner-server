import User from '../models/Users.js';
import Withdrawal from '../models/Withdrawal.js';
import FiatWithdrawal from '../models/NairaWithdrawal.js';
import Mining from '../models/Mining.js';
import { transferOp } from '../hive/operations.js';
import { getWithdrawalDetails } from '../hive/operations.js';
import TransactionHistory from '../models/transactionHistory.js';
import { transporter } from '../utils/nodemailer.js';

const acc = process.env.HIVE_ACC
 
//HIVE W LOGICS
export const requestWithdrawalToken = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const withdrawalToken = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenExpiry = Date.now() + 15 * 60 * 1000;

    user.withdrawalToken = withdrawalToken;
    user.withdrawalTokenExpires = tokenExpiry;

    await user.save();

    const mailOptions = {
      to: user.email,
      from: process.env.OUTLOOK_USER,
      subject: 'Your Secure Withdrawal Token from EkzaTrade',
      text: `Dear ${user.username},
    
    We hope this message finds you well. We noticed that you've initiated a withdrawal request on your EkzaTrade account. To ensure your security, we’ve generated a unique withdrawal token just for you.
    
    🔐 **Your Secure Withdrawal Token**: ${withdrawalToken}
    
    Please enter this token within the next 15 minutes to complete your transaction. This is a one-time use code and will expire promptly to protect your account.
    
    **Why this extra step?**
    At EkzaTrade, your security is our top priority. This token adds an additional layer of protection, ensuring that your funds are safe and only accessible by you.
    
    If you didn’t request this withdrawal or have any concerns, please reach out to our support team immediately at [Support Email/Contact Info]. We're here to help 24/7.
    
    Thank you for choosing EkzaTrade. We’re proud to be your trusted partner in trading.
    
    Warm regards,
    
    The EkzaTrade Team
    [ekzatrade@outlook.com]
    `,
    };
    

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: 'Withdrawal token sent to your email' });
  } catch (error) {
    console.error('Error requesting withdrawal token:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

export const processHiveWithdrawal = async (req, res) => {
  const { to, amount, currency, memo, withdrawalToken } = req.body;
  const userId = req.user.userId;

  if (!to || !amount || !currency || !withdrawalToken) {
    return res.status(400).json({ success: false, message: 'Recipient account, amount, currency and withdrawal token are required' });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.withdrawalToken !== withdrawalToken || Date.now() > user.withdrawalTokenExpires) {
      return res.status(400).json({ success: false, message: 'Invalid or expired withdrawal token' });
    }

    const asset = user.assets.find(asset => asset.currency.toLowerCase() === currency.toLowerCase());

    if (!asset) {
      return res.status(400).json({ success: false, message: `No asset found for currency: ${currency}` });
    }

    if (asset.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    const result = await transferOp(to, `${amount} ${currency.toUpperCase()}`, memo || '');

    const { id: trxId } = result;
    console.log('Transaction ID:', trxId);

    const transactionDetails = await getWithdrawalDetails(trxId);

    if (transactionDetails) {
      const { block_num: blockNumber } = transactionDetails;
      console.log('Transaction details:', transactionDetails);

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
        bankDetails: {},
      });

      await transactionHistory.save();
      console.log('Transaction history updated successfully.');
    }

    asset.balance -= amount;
    asset.asseUsdtWorth = asset.balance * asset.usdValue;
    asset.assetNairaWorth = asset.balance * asset.nairaValue;

    user.totalUsdValue = user.assets.reduce((total, asset) => total + (asset.asseUsdtWorth || 0), 0);
    user.totalNairaValue = user.assets.reduce((total, asset) => total + (asset.assetNairaWorth || 0), 0);

    user.withdrawalToken = null;
    user.withdrawalTokenExpires = null;

    await user.save();

    console.log('User after withdrawal:', user);

    return res.status(200).json({ success: true, message: 'Withdrawal successful', result });
  } catch (error) {
    console.error('Error processing withdrawal:', error.message);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

//////FIAT WITHDRAWAL LOGICS
export const requestFiatWithdrawal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount, accountNumber, withdrawalToken } = req.body;

    if (!amount || !accountNumber || !withdrawalToken) {
      return res.status(400).json({ success: false, message: 'Amount, account number, and withdrawal token are required' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.withdrawalToken !== withdrawalToken || Date.now() > user.withdrawalTokenExpires) {
      return res.status(400).json({ success: false, message: 'Invalid or expired withdrawal token' });
    }

    if (user.nairaBalance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient Naira balance' });
    }

    const selectedAccount = user.accounts.find(acc => acc.accountNumber === accountNumber);

    if (!selectedAccount) {
      return res.status(400).json({ success: false, message: 'Account not found' });
    }

    user.nairaBalance -= amount;
    user.totalNairaValue -= amount;

    const fiatWithdrawal = new FiatWithdrawal({
      userId,
      amount,
      account: {
        accountNumber: selectedAccount.accountNumber,
        accountName: selectedAccount.accountName,
        bankName: selectedAccount.bankName
      },
      status: 'pending'
    });

    await fiatWithdrawal.save();

    user.withdrawalToken = null;
    user.withdrawalTokenExpires = null;
    await user.save();

    return res.status(200).json({ success: true, message: 'Withdrawal request placed successfully' });
  } catch (error) {
    console.error('Error requesting fiat withdrawal:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

export const confirmFiatWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.body;

    if (!withdrawalId) {
      return res.status(400).json({ success: false, message: 'Withdrawal ID is required' });
    }

    const fiatWithdrawal = await FiatWithdrawal.findById(withdrawalId);

    if (!fiatWithdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal request not found' });
    }

    if (fiatWithdrawal.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Withdrawal request already processed' });
    }

    fiatWithdrawal.status = 'confirmed';
    await fiatWithdrawal.save();

    return res.status(200).json({ success: true, message: 'Withdrawal confirmed successfully' });
  } catch (error) {
    console.error('Error confirming fiat withdrawal:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

export const cancelFiatWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.body;

    if (!withdrawalId) {
      return res.status(400).json({ success: false, message: 'Withdrawal ID is required' });
    }

    const fiatWithdrawal = await FiatWithdrawal.findById(withdrawalId);

    if (!fiatWithdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal request not found' });
    }

    if (fiatWithdrawal.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Withdrawal request cannot be canceled' });
    }

    const user = await User.findById(fiatWithdrawal.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Reversing the user's balance if necessary
    user.nairaBalance += fiatWithdrawal.amount;
    user.totalNairaValue += fiatWithdrawal.amount;

    await user.save();

    fiatWithdrawal.status = 'canceled';
    await fiatWithdrawal.save();

    return res.status(200).json({ success: true, message: 'Withdrawal canceled successfully' });
  } catch (error) {
    console.error('Error canceling withdrawal:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

export const getAllFiatWithdrawals = async (req, res) => {
  try {
    const withdrawals = await FiatWithdrawal.find();

    const withdrawalWithUserDetails = await Promise.all(withdrawals.map(async (withdrawal) => {
      const user = await User.findById(withdrawal.userId).select('username email');
      return {
        ...withdrawal.toObject(),
        user: {
          username: user.username,
          email: user.email, 
        } 
      };
    }));

    return res.status(200).json({ success: true, withdrawals: withdrawalWithUserDetails });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};















/////////////////others........
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
