import mongoose from 'mongoose';

const profitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  currency: { type: String, required: true },
  nairaAmount: { type: Number, required: true },
  cryptoAmount: { type: Number, required: true },
  nairaFee: { type: Number, required: true },
  cryptoFee: { type: Number, required: true },
  transactionType: { type: String, enum: ['buy', 'sell', 'swap'], required: true },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
  timestamp: { type: Date, default: Date.now }
});

const Profit = mongoose.model('Profit', profitSchema);
export default Profit;
