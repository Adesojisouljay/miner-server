import User from "../models/Users.js";
import TransactionHistory from "../models/transactionHistory.js";
import { sendBtcFromHotWallet } from "../crypto/bitcoin/helper.js";
import { sendTrxFromHotWallet } from "../crypto/tron/helper.js";
import { trc20Tokens } from "../variables/trc20Tokens.js";
import { activitiesEmail } from "../utils/nodemailer.js";
import messages from "../variables/messages.js";
import { getTransactionFee } from "../crypto/tron/index.js";
import { calculateTransactionFee } from "../crypto/bitcoin/helper.js";

const baseTrxFee = 1;
const trxCongestionFee = 0.5;

export const sendCrypto = async (req, res) => {
    try {
        const { to, amount, currency } = req.body; 
        console.log("currency", currency)
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

                // Check if 'to' address belongs to a user on our exchange
            const receivingUser = await User.findOne({ 'assets.depositAddress': to });
            let isInternalTransfer = false;

            if (receivingUser) {
            isInternalTransfer = true;
            console.log('Internal transfer detected, user:', receivingUser.username);
            }

            let result;
            let txId;

        if(currency === "bitcoin") {
            result = await sendBtcFromHotWallet(currency, to, amount)
            console.log("object....", result)
            txId = result
        } else if (trc20Tokens.includes(currency)) {
            result = await sendTrxFromHotWallet(currency, to, amount)
            if(currency === "tether") {
                txId = result
            }
        }

        console.log(result)

            asset.balance -= amount;

            asset.asseUsdtWorth = asset.balance * asset.usdValue;
            asset.assetNairaWorth = asset.balance * asset.nairaValue;
        
            user.totalUsdValue = user.assets.reduce((total, asset) => total + (asset.asseUsdtWorth || 0), 0);
            user.totalNairaValue = user.assets.reduce((total, asset) => total + (asset.assetNairaWorth || 0), 0);
        
            user.token = null;
            user.tokenExpires = null;

            await user.save();

            const senderAddress = asset.depositAddress;

            const newTransaction = new TransactionHistory({
                userId: user._id,
                sender: senderAddress, // Use sender's deposit address
                receiver: to, // Receiver's deposit address
                trxId: txId || result.txid,
                amount: amount,
                currency,
                type: isInternalTransfer ? 'Internal Transfer' : 'Crypto Withdrawal',
                status: 'pending', // Mark as pending
                timestamp: new Date(),
              });
    
              await newTransaction.save();

            const emailContent = messages.withdrawalReceivedEmail(user.username, amount, currency);
            activitiesEmail(user.email, messages.withdrawalReceivedSubject, emailContent);

            if (isInternalTransfer) {
                const receiverEmailContent = messages.depositPendingEmail(receivingUser.username, amount, currency);
                activitiesEmail(receivingUser.email, messages.depositPendingSubject, receiverEmailContent);
              }

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

export const getFees = async (req, res) => {
    const { coinId, fromAddress, toAddress } = req.params;

    try {
        let feeResponse;

        // Check which coinId is being requested and call the appropriate fee calculation
        if (coinId === "tether") {
            console.log(fromAddress, toAddress, "....addres.l...")
            const response = await getTransactionFee(fromAddress, toAddress);
            console.log("TRC20 Fee Response:", response);

            const energyFee = parseFloat(response.energyFee);
            let totalFee;

            if (energyFee < baseTrxFee) {
                totalFee = baseTrxFee;
            } else {
                totalFee = baseTrxFee + trxCongestionFee;
            }

            feeResponse = totalFee.toFixed(3);
            console.log(feeResponse, "...fee")
        } else if (coinId === "bitcoin") {
            const response = await calculateTransactionFee();
            console.log("Bitcoin Fee Response:", response);

            feeResponse = response.feeInBTC;
        } else {
            feeResponse = 0.000
        }

        res.json({
            success: true,
            fee: feeResponse,
        });
    } catch (error) {
        console.error('Error getting transaction fees:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};  
 