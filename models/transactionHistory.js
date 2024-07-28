import mongoose from 'mongoose';

const transactionHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Add this line
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  memo: { type: String, required: false },
  trxId: { type: String, required: true, unique: true },
  blockNumber: { type: String, required: true, unique: true },
  amount: { type: String, required: true },
  currency: { type: String, required: true },
  type: { type: String, required: true },
  bankDetails: {
    accountNumber: { type: String },
    bankName: { type: String },
    accountHolderName: { type: String }
  },
  timestamp: { type: Date, default: Date.now }
});

const TransactionHistory = mongoose.model('TransactionHistory', transactionHistorySchema);

export default TransactionHistory;
