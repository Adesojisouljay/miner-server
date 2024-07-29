import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  currency: { type: String, required: true }, // e.g., 'hive', 'hbd', 'btc'
  balance: { type: Number, default: 0 },
  depositAddress: { type: String, required: true },
  memo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
},
{ _id: false }
);

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  walletAddress: { type: String, required: true },
  assets: [assetSchema],
  nairaBalance: { type: Number, default: 0 },
  totalBalance: { type: Number, default: 0 },
  totalNairaValue: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

export default User;
