import axios from 'axios';

const API_URL = 'https://api.coingecko.com/api/v3';

export const fetchCryptoData = async () => {
  try {
    const response = await axios.get(`${API_URL}/coins/markets?vs_currency=usd&ids=hive%2C%20hive_dollar&order=market_cap_desc&per_page=100&page=1&sparkline=false`);
    return response.data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
};
