import User from "../models/Users.js";
import { sendFromHotWallet } from "../crypto/bitcoin/helper.js";
import { activitiesEmail } from "../utils/nodemailer.js";
import messages from "../variables/messages.js";

export const sendCrypto = async (req, res) => {
    try {
        const { to, amount, currency } = req.body; 
        const userId = req.user.userId; 

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const asset = user.assets.find(asset => asset.currency === currency);

        if (!asset) {
            return res.status(400).json({ success: false, message: 'Asset not found for this user' });
        }

        if (asset.balance < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }

        const result = await sendFromHotWallet(currency, to, amount);

            asset.balance -= amount;

            asset.asseUsdtWorth = asset.balance * asset.usdValue;
            asset.assetNairaWorth = asset.balance * asset.nairaValue;
        
            user.totalUsdValue = user.assets.reduce((total, asset) => total + (asset.asseUsdtWorth || 0), 0);
            user.totalNairaValue = user.assets.reduce((total, asset) => total + (asset.assetNairaWorth || 0), 0);
        
            user.token = null;
            user.tokenExpires = null;

            await user.save();

            const emailContent = messages.withdrawalReceivedEmail(user.username, amount, currency);
            activitiesEmail(user.email, messages.withdrawalReceivedSubject, emailContent);

            console.log(result);
            return res.status(200).json({success: true, message: 'Transaction successful', result });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: 'Transaction failed',
            error: error.message || 'An unknown error occurred' 
        });
    }
};
