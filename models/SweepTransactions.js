import mongoose from 'mongoose';

const sweptTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  amountSwept: {
    type: Number,
    required: true,
  },
  txId: {
    type: String,
    required: true,
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'failed'], default: 'pending' 
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

const SweptTransaction = mongoose.model('SweptTransaction', sweptTransactionSchema);

export default SweptTransaction;
