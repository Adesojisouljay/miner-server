import Deposit from '../models/Deposit.js';
import User from '../models/Users.js';
import Mining from '../models/Mining.js';


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