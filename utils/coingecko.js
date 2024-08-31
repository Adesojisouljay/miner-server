import cron from 'node-cron';
import axios from 'axios';
import { coinIdsArray } from '../variables/listedTokens.js';
import CryptoData  from '../models/CryptoData.js';

const API_URL = 'https://api.coingecko.com/api/v3';

export const fetchCryptoData = async () => {
  try {
    const coinIds = encodeURIComponent(coinIdsArray.join(','));

    const responseUSD = await axios.get(`${API_URL}/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=100&page=1&sparkline=false`);
    const usdData = responseUSD.data;

    const responseNGN = await axios.get(`${API_URL}/coins/markets?vs_currency=ngn&ids=${coinIds}&order=market_cap_desc&per_page=100&page=1&sparkline=false`);
    const ngnData = responseNGN.data;

    await CryptoData.findOneAndUpdate(
      {},
      {
        usdData,
        ngnData,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
    return { usdData, ngnData }
  } catch (error) {
    console.error('Error updating crypto data:', error);
  }
};

cron.schedule('*/5 * * * *', fetchCryptoData);
