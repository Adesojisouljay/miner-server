import axios from 'axios';
import { coinIdsArray } from '../variables/listedTokens.js';

const API_URL = 'https://api.coingecko.com/api/v3';

export const fetchCryptoData = async () => {
  try {

    const coinIds = encodeURIComponent(coinIdsArray.join(','));

    const responseUSD = await axios.get(`${API_URL}/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=100&page=1&sparkline=false`);
    const usdData = responseUSD.data;
    console.log(usdData);

    const responseNGN = await axios.get(`${API_URL}/coins/markets?vs_currency=ngn&ids=${coinIds}&order=market_cap_desc&per_page=100&page=1&sparkline=false`);
    const ngnData = responseNGN.data;

    return { usdData, ngnData };
  } catch (error) {
    console.error('Error fetching market data:', error);
  }
};
