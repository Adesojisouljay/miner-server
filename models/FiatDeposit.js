import mongoose from 'mongoose';

const nairaDepositRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  amount: { type: Number, required: true },
  narration: { type: String, required: true },
  depositMethod: { type: String, enum: ['bank', 'p2p']},
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  user: {
    username: { type: String },
    email: { type: String }
  },
  merchant: {
    username: { type: String }
  }
});

const NairaDepositRequest = mongoose.model('NairaDepositRequest', nairaDepositRequestSchema);

export default NairaDepositRequest;
