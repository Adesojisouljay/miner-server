import mongoose from 'mongoose';

const adminApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const AdminApplication = mongoose.model('AdminApplication', adminApplicationSchema);

export default AdminApplication;
