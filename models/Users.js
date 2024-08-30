import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  currency: { type: String, required: true },
  balance: { type: Number, default: 0 },
  depositAddress: { type: String },
  memo: { type: String },
  usdValue: { type: Number, default: 0 },
  nairaValue: { type: Number, default: 0 },
  assetNairaWorth: { type: Number, default: 0 },
  coinId: { type: String },
  symbol: { type: String },
  priceChange: { type: Number },
  asseUsdtWorth: { type: Number },
  percentageChange: { type: Number },
  image: { type: String },
  privateKey: { type: String, default: null },
}, { _id: false });

const accountSchema = new mongoose.Schema({
  accountNumber: { type: String, required: true },
  accountName: { type: String, required: true },
  bankName: { type: String, required: true },
  id: { type: String },
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  otherName: { type: String },
  assets: [assetSchema],
  nairaBalance: { type: Number, default: 0 },
  totalUsdValue: { type: Number, default: 0 },
  totalNairaValue: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  accounts: [accountSchema],
  profileImage: { type: String },
  resetPasswordToken: { type: String }, 
  resetPasswordExpires: { type: Date },
  withdrawalToken: { type: String },
  withdrawalTokenExpires: { type: Date },
  kyc: { type: mongoose.Schema.Types.ObjectId, ref: 'KYC' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

export default User;
