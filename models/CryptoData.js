import mongoose from 'mongoose';

const newsItemSchema = new mongoose.Schema({
  url: String,
  title: String,
  description: String,
  thumbnail: String,
  createdAt: String,
  _id: { type: mongoose.Schema.Types.ObjectId, default: new mongoose.Types.ObjectId() },  // Automatically generate ObjectId
});

const cryptoDataSchema = new mongoose.Schema({
  usdData: {
    type: Array,
    require: true,
  },
  ngnData: {
    type: Array,
    require: true,
  },
  newsData: {
    type: [newsItemSchema],
    require: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const CryptoData = mongoose.model('CryptoData', cryptoDataSchema);

export default CryptoData;
