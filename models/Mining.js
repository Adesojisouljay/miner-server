import mongoose from 'mongoose';

const miningSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    miningRate: { type: Number, required: true },
    totalMined: { type: Number, default: 0 },
    withdrawableBalance: { type: Number, default: 0 },
    nextWithdrawalTime: { type: Date },
    isMining: { type: Boolean, default: false },
    startTime: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

const Mining = mongoose.model('Mining', miningSchema);

export default Mining;
