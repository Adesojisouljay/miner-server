import User from "../../models/Users.js";
import SweptTransaction from "../../models/SweepTransactions.js";
import { calculateTransactionFee } from "./helper.js";
import { getAddressBalance, sendTrx } from "./index.js";

/////wil check this fil later
const usdtContractAdd = "41eca9bc828a3005b9a3b909f2cc5c2a54794de05f"

export const sweepTrxBalancesToHotWallet = async () => {
    try {
        const hotWalletUser = await User.findOne({ username: 'Ekzahot', role: 'admin' });

        if (!hotWalletUser || !hotWalletUser.assets) {
            console.error("Hot wallet user not found or has no assets.");
            return;
        }

        const hotWallet = hotWalletUser.assets.find(asset => asset.currency === "tron" || asset.currency === "tether");
        const hotWalletAddress = hotWallet?.depositAddress;

        if (!hotWalletAddress) {
            console.error("Hot wallet address not found for the user.");
            return;
        }

        const usersWithToken = await User.find({
            'assets.currency': { $in: ['tron', 'tether'] },
            'assets.balance': { $gte: 10 }
        });

        for (const user of usersWithToken) {
            if (user.username === 'Ekzahot' || user.username === 'admin') {
                console.log("Skipping to sweep the hot wallet and admin user: trx/tron.");
                continue;
            }

            const trxAsset = user.assets.find(asset => asset.currency === "tron" || asset.currency === "tether");

            if (trxAsset && trxAsset.balance > 10) {
                // Log the asset type for verification
                console.log(`Processing ${trxAsset.currency} for user: ${user.username}`);

                const fee = await calculateTransactionFee(hotWalletAddress, trxAsset.depositAddress);

                let addressBalance;
                if (trxAsset.currency === "tron") {
                    // Fetch TRX balance
                    addressBalance = await getAddressBalance(trxAsset.depositAddress);  // native balance fetch for TRX
                    console.log(`Fetched TRX balance: ${addressBalance}`);
                } else if (trxAsset.currency === "tether") {
                    // Fetch USDT balance via the contract
                    addressBalance = await getAddressBalance(trxAsset.depositAddress, usdtContractAdd);
                    console.log(`Fetched USDT balance: ${addressBalance}`);
                }

                const amountTosweep = Number(addressBalance) - fee.energyFee;
                console.log(`Sweepable amount for ${trxAsset.currency}: ${amountTosweep}`);

                if (amountTosweep > 0) {
                    try {
                        // Handle transfer differently for TRX and USDT
                        const sweepTx = await sendTrx(
                            trxAsset.depositAddress,
                            hotWalletAddress,
                            amountTosweep,
                            trxAsset.privateKey,
                            trxAsset.currency
                        );

                        // Update user balance after sweep
                        trxAsset.balance = parseFloat((trxAsset.balance - amountTosweep).toFixed(8));
                        trxAsset.asseUsdtWorth = trxAsset.balance * trxAsset.usdValue;
                        trxAsset.assetNairaWorth = trxAsset.balance * trxAsset.nairaValue;

                        user.totalUsdValue = user.assets.reduce((total, asset) => total + (asset.asseUsdtWorth || 0), 0);
                        user.totalNairaValue = user.assets.reduce((total, asset) => total + (asset.assetNairaWorth || 0), 0);

                        await user.save();

                        // Save the sweep transaction
                        await SweptTransaction.create({
                            userId: user._id,
                            amountSwept: amountTosweep,
                            txId: trxAsset.currency === "tether" ? sweepTx : sweepTx.txid,
                            timestamp: new Date(),
                        });

                        console.log(`User ${user.username}'s balance of ${amountTosweep} ${trxAsset.currency} swept to hot wallet. Transaction: ${sweepTx}`);

                    } catch (error) {
                        console.error(`Failed to send ${trxAsset.currency} for user ${user.username}:`, error);
                    }
                } else {
                    console.log(`Invalid sweepable ${trxAsset.currency} amount (${amountTosweep}) for user ${user.username}.`);
                    continue;
                }
            } else {
                console.log(`User ${user.username} does not have a sufficient ${trxAsset.currency} balance to sweep.`);
            }
        }
    } catch (error) {
        console.error("Error sweeping balances:", error);
    }
};

export const sweepTronBalances = async () => {
    try {

        const hotWalletUser = await User.findOne({ username: 'Ekzahot', role: 'admin' });

        if (!hotWalletUser || !hotWalletUser.assets) {
            console.error("Hot wallet user not found or has no assets.");
            return;
        }

        const hotWallet = hotWalletUser.assets.find(asset => asset.currency === "tron" || asset.currency === "tether");
        const hotWalletAddress = hotWallet?.depositAddress;

        const usersWithTrx = await User.find({
            'assets.currency': 'tron',
            'assets.balance': { $gte: 10 }
        });

        for (const user of usersWithTrx) {
            if (user.username === 'Ekzahot' || user.username === 'admin') {
                console.log("Skipping to sweep the hot wallet and admin user: TRX.");
                continue;
            }

            const trxAsset = user.assets.find(asset => asset.currency === "tron");

            if (trxAsset && trxAsset.balance > 10) {
                console.log(`Processing TRX for user: ${user.username}`);

                const fee = await calculateTransactionFee(hotWalletAddress, trxAsset.depositAddress);

                const addressBalance = await getAddressBalance(trxAsset.depositAddress);  // native balance fetch for TRX
                console.log(`Fetched TRX balance: ${addressBalance}`);

                const amountToSweep = Number(addressBalance) - fee.energyFee;

                if (amountToSweep > 0) {
                    try {
                        const sweepTx = await sendTrx(
                            trxAsset.depositAddress,
                            hotWalletAddress,
                            amountToSweep,
                            trxAsset.privateKey,
                            "tron"
                        );

                        trxAsset.balance = parseFloat((trxAsset.balance - amountToSweep).toFixed(8));
                        trxAsset.asseUsdtWorth = trxAsset.balance * trxAsset.usdValue;
                        trxAsset.assetNairaWorth = trxAsset.balance * trxAsset.nairaValue;

                        user.totalUsdValue = user.assets.reduce((total, asset) => total + (asset.asseUsdtWorth || 0), 0);
                        user.totalNairaValue = user.assets.reduce((total, asset) => total + (asset.assetNairaWorth || 0), 0);

                        await user.save();

                        await SweptTransaction.create({
                            userId: user._id,
                            amountSwept: amountToSweep,
                            txId: sweepTx.txid,
                            timestamp: new Date(),
                        });

                        console.log(`User ${user.username}'s TRX balance of ${amountToSweep} swept to hot wallet. Transaction: ${sweepTx.txid}`);
                    } catch (error) {
                        console.error(`Failed to send TRX for user ${user.username}:`, error);
                    }
                } else {
                    console.log(`Insufficient sweepable TRX amount (${amountToSweep}) for user ${user.username}.`);
                }
            }
        }
    } catch (error) {
        console.error("Error sweeping TRX balances:", error);
    }
};

// sweepTronBalances()
//  sweepTrxBalancesToHotWallet() 