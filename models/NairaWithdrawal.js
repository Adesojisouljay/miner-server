import mongoose from 'mongoose';

const fiatWithdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  account: { 
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true },
    bankName: { type: String, required: true }
  },
  status: { type: String, enum: ['pending', 'confirmed', 'canceled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const FiatWithdrawal = mongoose.model('FiatWithdrawal', fiatWithdrawalSchema);

export default FiatWithdrawal;
