import transactionHistory from '../models/transactionHistory.js';

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
