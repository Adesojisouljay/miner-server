import axios from 'axios';

const API_URL = 'https://api.coingecko.com/api/v3';

export const fetchCryptoData = async () => {
  try {
    // Fetch USD values
    const responseUSD = await axios.get(`${API_URL}/coins/markets?vs_currency=usd&ids=hive%2C%20hive_dollar&order=market_cap_desc&per_page=100&page=1&sparkline=false`);
    const usdData = responseUSD.data;

    // Fetch NGN values
    const responseNGN = await axios.get(`${API_URL}/coins/markets?vs_currency=ngn&ids=hive%2C%20hive_dollar&order=market_cap_desc&per_page=100&page=1&sparkline=false`);
    const ngnData = responseNGN.data;

    return { usdData, ngnData };
  } catch (error) {
    console.error('Error fetching market data:', error);
  }
};
