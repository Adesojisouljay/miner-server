import { watchAllBitcoinDeposits, processPendingTransactions } from "../crypto/bitcoin/transactions.js";
import { sweepBalancesToHotWallet, updateSweepStatus } from "../crypto/bitcoin/sweep.js";
import cron from "node-cron"

export const watchAllBtcDeposits = cron.schedule('*/5 * * * *', watchAllBitcoinDeposits);

export const processPendingBtcTransactions = cron.schedule('*/5 * * * *', processPendingTransactions);

export const sweepBtcBalancesToHotWallet = cron.schedule('*/30 * * * *', sweepBalancesToHotWallet);

export const updateBtcSweepStatus = cron.schedule('*/60 * * * *', updateSweepStatus);
