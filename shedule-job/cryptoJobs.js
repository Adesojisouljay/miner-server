import cron from "node-cron"
import { watchAllBitcoinDeposits, processPendingTransactions } from "../crypto/bitcoin/transactions.js";
import { sweepBalancesToHotWallet, updateSweepStatus } from "../crypto/bitcoin/sweep.js";
import { processPendingTrxTransactions, watchAllTrxDeposits, watchAllTronDeposits } from "../crypto/tron/watchJobs.js";
import { sweepTrxBalancesToHotWallet, sweepTronBalances } from "../crypto/tron/sweep.js";

export const watchAllBtcDeposits = cron.schedule('*/10 * * * *', watchAllBitcoinDeposits);

export const processPendingBtcTransactions = cron.schedule('*/12 * * * *', processPendingTransactions);

export const sweepBtcBalancesToHotWallet = cron.schedule('*/30 * * * *', sweepBalancesToHotWallet);

export const updateBtcSweepStatus = cron.schedule('*/60 * * * *', updateSweepStatus);


///////////TRX watched
export const processTrxTransactions = cron.schedule('*/5 * * * *', processPendingTrxTransactions);
export const watchTrxDeposits = cron.schedule('*/5 * * * *', watchAllTrxDeposits);
// export const watchTronDeposits = cron.schedule('*/1 * * * *', watchAllTronDeposits);

// will take a look later
// export const sweepTrxBalances = cron.schedule('*/5 * * * *', sweepTrxBalancesToHotWallet); 
// export const sweepTron = cron.schedule('*/1 * * * *', sweepTronBalances); 
 

