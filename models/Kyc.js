import mongoose from 'mongoose';

const kycSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  otherName: { type: String },
  idDocument: { type: String, required: true },
  selfie: { type: String, required: true },
  kycStatus: { 
    type: String, 
    enum: ['Pending', 'Verified', 'Rejected'], 
    default: 'Pending' 
  },
  verifiedAt: { type: Date },
  rejectedAt: { type: Date },
  rejectionReason: { type: String }
});

const KYC = mongoose.model('KYC', kycSchema);

export default KYC;
