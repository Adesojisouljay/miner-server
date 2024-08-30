import { fetchCryptoData } from "../utils/coingecko.js";

export const getCrytpoData = async (req, res) => {

    try {
      const data = await fetchCryptoData();
      if (data) {
        res.json({
          success: true,
          cryptoData:{
          usdData: data.usdData,
          ngnData: data.ngnData
        }
        });
      } else {
        res.status(500).json({ success: false, message: 'Failed to fetch cryptocurrency data.' });
      }
    } catch (error) {
      console.error('Error in /crypto-data endpoint:', error);
      res.status(500).json({ success: false, message: 'An error occurred while processing your request.' });
    }
  }
  