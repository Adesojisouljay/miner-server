import { sendBitcoin } from "../crypto/bitcoin/transactions.js";
import { decryptPrivateKey } from "../utils/index.js";
import User from "../models/Users.js";

export const sendCrypto = async (req, res) => {
    try {
        const { receiverAddress, amount, coinId } = req.body; 
        const { userId } = req.user; 

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const asset = user.assets.find(asset => asset.coinId === coinId);

        if (!asset) {
            return res.status(400).json({ success: false, message: 'Asset not found for this user' });
        }

        if (asset.balance < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }

        const decryptedPrivateKey = decryptPrivateKey(asset.privateKey); 

        const result = await sendBitcoin(asset.depositAddress, decryptedPrivateKey, receiverAddress, amount);

        if (result.success) {
            asset.balance -= amount;

            asset.asseUsdtWorth = asset.balance * asset.usdValue;
            asset.assetNairaWorth = asset.balance * asset.nairaValue;
        
            user.totalUsdValue = user.assets.reduce((total, asset) => total + (asset.asseUsdtWorth || 0), 0);
            user.totalNairaValue = user.assets.reduce((total, asset) => total + (asset.assetNairaWorth || 0), 0);
        
            user.token = null;
            user.tokenExpires = null;

            await user.save();

            console.log(result.message, ".....");
            return res.status(200).json({ message: 'Transaction successful', result });
        } else {
            return res.status(500).json({ message: 'Transaction failed', result });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: 'Transaction failed',
            error: error.message || 'An unknown error occurred' 
        });
    }
};
