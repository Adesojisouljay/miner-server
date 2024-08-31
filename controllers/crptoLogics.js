import CryptoData from "../models/CryptoData.js";

export const getCrytpoData = async (req, res) => {
  try {
    const cryptoData = await CryptoData.findOne().sort({ lastUpdated: -1 });

    if (cryptoData) {
      res.json({
        success: true,
        cryptoData: {
          usdData: cryptoData.usdData,
          ngnData: cryptoData.ngnData
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
