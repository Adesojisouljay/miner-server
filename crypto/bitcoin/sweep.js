import User from "../../models/Users.js";
import SweptTransaction from "../../models/SweepTransactions.js";
import { sendBitcoin, checkTransactionStatus } from "./transactions.js";
import { calculateSweepableAmount } from "./helper.js";

export const sweepBalancesToHotWallet = async () => {
    try {
      const hotWalletUser = await User.findOne({ username: 'Ekzahot', role: 'admin' });
  
      if (!hotWalletUser || !hotWalletUser.assets) {
        console.error("Hot wallet user not found or has no assets.");
        return;
      }
  
      const hotWalletAddress = hotWalletUser.assets.find(asset => asset.currency === 'bitcoin')?.depositAddress;
  
      if (!hotWalletAddress) {
        console.error("Hot wallet address not found for the user.");
        return;
      }
  
      const usersWithBTC = await User.find({ 'assets.currency': 'bitcoin', 'assets.balance': { $gte: 0.0001 } });
      
      for (const user of usersWithBTC) {
        if (user.username === 'Ekzahot' || user.username === 'admin') {
          console.log("Skipping to sweep the hot wallet and admin user.");
          continue;
        }

        const btcAsset = user.assets.find(asset => asset.currency === 'bitcoin');
        
        if (btcAsset && btcAsset.balance > 0.0001) {

          const sweepableAmount = await calculateSweepableAmount(btcAsset.depositAddress)
          console.log(sweepableAmount, "sweep........able")

          if (sweepableAmount && sweepableAmount > 0) {
            try {
              const sweepTx = await sendBitcoin(btcAsset.depositAddress, btcAsset.privateKey, hotWalletAddress, sweepableAmount);
    
              btcAsset.balance = parseFloat((btcAsset.balance - sweepableAmount).toFixed(8));
    
              btcAsset.asseUsdtWorth = btcAsset.balance * btcAsset.usdValue;
              btcAsset.assetNairaWorth = btcAsset.balance * btcAsset.nairaValue;
    
              user.totalUsdValue = user.assets.reduce((total, asset) => total + (asset.asseUsdtWorth || 0), 0);
              user.totalNairaValue = user.assets.reduce((total, asset) => total + (asset.assetNairaWorth || 0), 0);
    
              await user.save();
  
            await SweptTransaction.create({
              userId: user._id,
              amountSwept: sweepableAmount,
              txId: sweepTx,
              timestamp: new Date(),
            });
    
              console.log(`User ${user.username}'s balance of ${sweepableAmount} BTC swept to hot wallet. Transaction: ${sweepTx}`);
  
            } catch (error) {
              console.error(`Failed to send Bitcoin for user ${user.username}:`, error);
            }
            } else {
                console.log(`Invalid sweepable amount (${sweepableAmount}) for user ${user.username}.`);
                continue;
            }        
  
        } else {
          console.log(`User ${user.username} does not have a sufficient Bitcoin balance to sweep.`);
        }
      }
    } catch (error) {
      console.error("Error sweeping balances:", error);
    }
  };

  export const updateSweepStatus = async () => {
    try {
        const sweptTxs = await SweptTransaction.find();

        for (const tx of sweptTxs) {
            const { confirmed } = await checkTransactionStatus(tx.txId);
            
            let status;

            if(confirmed) {
              status = "confirmed"
              await SweptTransaction.updateOne({ txId: tx.txId }, { status });
              console.log(`Transaction ${tx.txId} status updated to ${status}.`);
            } else {
              console.log(`Transaction ${tx.txId} has not yet been not confirmed.`);

            }

        }
    } catch (error) {
        console.error("Failed to update sweep statuses:", error);
    }
};
  