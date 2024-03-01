import mongoose from 'mongoose';

const depositSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  walletAddress: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Canceled'], default: 'Pending' }
}, { timestamps: true });

const Deposit = mongoose.model('Deposit', depositSchema);

export default Deposit;
