import User from "../models/Users.js";

export const takeTransactionFee = async (feeAmount, currencySymbol) => {
    try {
      const adminAccount = await User.findOne({ username: 'admin' });
  
      if (!adminAccount) {
        throw new Error('Admin account not found');
      }
  
      const adminAsset = adminAccount.assets.find(asset => asset.currency === currencySymbol);
      console.log(feeAmount)
  
      if (!adminAsset) {
        throw new Error(`Admin account does not hold ${currencySymbol}`);
      }
  
      adminAsset.balance += feeAmount;
      await adminAccount.save();
  
      console.log(`Successfully transferred ${feeAmount} ${currencySymbol} to admin account`);
    } catch (error) {
      console.error('Error transferring fee to admin:', error.message);
    }
  };
