import axios from "axios";
import CryptoData from "../models/CryptoData.js";

export const getCrytpoData = async (req, res) => {
  try {
    const cryptoData = await CryptoData.findOne().sort({ lastUpdated: -1 });

    if (cryptoData) {
      res.json({
        success: true,
        cryptoData: {
          usdData: cryptoData.usdData,
          ngnData: cryptoData.ngnData,
          newsData: cryptoData.newsData
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'No cryptocurrency data available.' });
    }
  } catch (error) {
    console.error('Error fetching crypto data from DB:', error);
    res.status(500).json({ success: false, message: 'An error occurred while processing your request.' });
  }
};

export const getSingleNews = async (req, res) => {
  const { id } = req.params;

  try {
    const cryptoData = await CryptoData.findOne({ 'newsData._id': id });

    if (cryptoData) {
      const newsItem = cryptoData.newsData.find(news => news._id.toString() === id);
      res.json({
        success: true,
        news: newsItem
      });
    } else {
      res.status(404).json({ success: false, message: 'News item not found.' });
    }
  } catch (error) {
    console.error('Error fetching news item by ID:', error);
    res.status(500).json({ success: false, message: 'An error occurred while fetching news item.' });
  }
};


