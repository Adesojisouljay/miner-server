import mongoose from 'mongoose';

const transactionHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  sender: { type: String},
  receiver: { type: String },
  memo: { type: String, required: false },
  trxId: { type: String, required: true, unique: true },
  blockNumber: { type: String, required: true, unique: true },
  fromAmount: { type: Number },
  fromCurrency: { type: String },
  toAmount: { type: Number },
  toCurrency: { type: String },
  rate: { type: Number },
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
