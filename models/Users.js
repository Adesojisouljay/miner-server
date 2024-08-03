import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  currency: { type: String, required: true }, // e.g., 'hive', 'hbd', 'btc'
  balance: { type: Number, default: 0 },
  depositAddress: { type: String, required: true },
  memo: { type: String, required: true },
  usdValue: { type: Number, default: 0 },
  nairaValue: { type: Number, default: 0 },
  assetNairaWorth: { type: Number, default: 0 },
  coinId: { type: String },
  symbol: { type: String },
  priceChange: { type: Number },
  assetWorth: { type: Number },
  percentageChange: { type: Number },
  image: { type: String },
  privateKey: { type: String, default: null },
}, { _id: false });

const accountSchema = new mongoose.Schema({
  accountNumber: { type: String, required: true },
  accountName: { type: String, required: true },
  bankName: { type: String, required: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  walletAddress: { type: String, required: true },
  assets: [assetSchema],
  nairaBalance: { type: Number, default: 0 },
  totalUsdValue: { type: Number, default: 0 },
  totalNairaValue: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  accounts: [accountSchema],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

export default User;
