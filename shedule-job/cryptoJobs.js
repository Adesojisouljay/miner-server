import { watchAllBitcoinDeposits, processPendingTransactions } from "../crypto/bitcoin/transactions.js";
import cron from "node-cron"

export const watchAllBtcDeposits = cron.schedule('*/1 * * * *', watchAllBitcoinDeposits);

export const processPendingBtcTransactions = cron.schedule('*/5 * * * *', processPendingTransactions);
