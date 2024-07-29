import cron from 'node-cron';
import axios from 'axios';
import User from '../models/Users.js';
import { fetchCryptoData } from './coingecko.js';

const updateAssetValues = async () => {
  try {
    const cryptoData = await fetchCryptoData();

    await Promise.all(cryptoData.map(async (info) => {
      const { id, symbol, current_price, price_change_24h, price_change_percentage_24h, image } = info;

      const users = await User.find({ 'assets.coinId': id });

      for (const user of users) {
        let totalAssetWorth = 0;

        for (const asset of user.assets) {
          if (asset.coinId === id) {
            asset.usdValue = current_price;
            asset.priceChange = price_change_24h;
            asset.percentageChange = price_change_percentage_24h;
            asset.image = image;
            asset.assetWorth = asset.balance * current_price;
          }
          totalAssetWorth += asset.assetWorth;
        }

        user.totalBalance = totalAssetWorth;

        await user.save();
      }
    }));

    console.log('Asset values and total balances updated successfully.');
  } catch (error) {
    console.error('Error updating asset values:', error.message);
  }
};

export const updateCryptos = cron.schedule('*/1 * * * *', updateAssetValues);
