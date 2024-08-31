import mongoose from 'mongoose';

const cryptoDataSchema = new mongoose.Schema({
  usdData: {
    type: Array,
    required: true
  },
  ngnData: {
    type: Array,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const CryptoData = mongoose.model('CryptoData', cryptoDataSchema);

export default CryptoData
