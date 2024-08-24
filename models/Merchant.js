import mongoose from 'mongoose';

const merchantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true, unique: true },
  accountNumber: { type: String, required: true, unique: true },
  accountName: { type: String, required: true },
  bankName: { type: String, required: true },
  residentialAddress: { type: String, required: true },
  residencePicture: { type: String, required: true },
  selfiePhotograph: { type: String, required: true },
  NIN: { type: String, required: true, unique: true },
  BVN: { type: String, required: true, unique: true },
  socialMediaHandle: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'cancelled'], default: 'pending' },
  isActive: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Merchant = mongoose.model('Merchant', merchantSchema);

export default Merchant;
