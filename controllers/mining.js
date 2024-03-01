import Mining from '../models/Mining.js';
import User from '../models/Users.js';

export const startMining = async (req, res) => {
    try {
      const userId = req.user.userId;
  
      let mining = await Mining.findOne({ userId });
  
      if (!mining) {
        mining = new Mining({
          userId,
          miningRate: 0,
          isMining: true,
          startTime: new Date()
        });
  
        await mining.save();
      } else {

        mining.isMining = true;
        mining.startTime = new Date(); 
        await mining.save();
      }
  
      res.status(200).json({ success: true, message: 'Mining process started successfully' });
    } catch (error) {
      console.error('Error starting mining process:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };  

  export const getUserMiningRecord = async (req, res) => {
    try {
      const userId = req.params.userId;
  
      const miningRecord = await Mining.findOne({ userId });
  
      if (!miningRecord) {
        return res.status(404).json({ success: false, message: 'Mining record not found' });
      }
  
      res.status(200).json({ success: true, miningRecord });
    } catch (error) {
      console.error('Error retrieving user mining record:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };
  
  export const transferMinedBalance = async (req, res) => {
    try {
      const userId = req.user.userId;
  
      let miningRecord = await Mining.findOne({ userId });
      console.log("first", miningRecord)
  
      if (!miningRecord) {
        return res.status(404).json({ success: false, message: 'Mining record not found' });
      }
  
      const minedBalance = miningRecord.totalMined;
      console.log(minedBalance)
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      user.balance += minedBalance;
    
        await user.save();
  
      await miningRecord.save();
      
      const APR = 0.15; // 15% APR
      const newMiningRate = +(user.balance * APR / (365 * 24 * 60 * 60 * 100));
  
      miningRecord.totalMined = 0;
      miningRecord.miningRate = newMiningRate;
      await miningRecord.save();
  
      res.status(200).json({ success: true, message: 'Mined balance transferred successfully' });
    } catch (error) {
      console.error('Error transferring mined balance:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };
  
