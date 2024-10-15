import cron from 'node-cron';
import axios from 'axios';
import { coinIdsArray } from '../variables/listedTokens.js';
import CryptoData  from '../models/CryptoData.js';
import mongoose from 'mongoose';

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

export const fetchCryptoNews = async () => {
  try {
    const newsOptions = {
      method: 'GET',
      url: 'https://cryptocurrency-news2.p.rapidapi.com/v1/cryptodaily',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'cryptocurrency-news2.p.rapidapi.com',
      },
    };

    const newsResponse = await axios.request(newsOptions);
    const fetchedNews = newsResponse.data.data;

    // Check for existing news data in the database
    const existingData = await CryptoData.findOne({}, { newsData: 1 });
    const existingNews = existingData ? existingData.newsData : [];

    // Map existing news by URL for deduplication
    const existingNewsMap = new Map(existingNews.map(news => [news.url, news._id]));

    // Assign a unique ID to each news item and update newsData
    const newsData = fetchedNews.map(news => ({
      ...news,
      _id: existingNewsMap.get(news.url) || new mongoose.Types.ObjectId(), // Reuse ID if it exists, else create new one
    }));

    console.log(newsData, "......llll.llkk..")

    // Update crypto news in the database
    await CryptoData.findOneAndUpdate(
      {},
      {
        newsData,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error fetching crypto news:', error.message || error);
    return [];
  }
};

// cron.schedule('*/30 * * * *', fetchCryptoNews);
cron.schedule('*/5 * * * *', fetchCryptoData);
