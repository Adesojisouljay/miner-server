import cron from 'node-cron';
import User from '../models/Users.js';
import { fetchCryptoData } from './coingecko.js';

const updateAssetValues = async () => {
  try {
    const { usdData, ngnData } = await fetchCryptoData();

    await Promise.all(usdData.map(async (usdInfo) => {
      const ngnInfo = ngnData.find(ngn => ngn.id === usdInfo.id);

      const { id, symbol, current_price: usdPrice, price_change_24h, price_change_percentage_24h, image } = usdInfo;
      const ngnPrice = ngnInfo ? ngnInfo.current_price : 0;

      const users = await User.find({ 'assets.coinId': id });

      for (const user of users) {
        let totalUSDValue = 0;
        let totalNairaValue = 0;

        for (const asset of user.assets) {
          if (asset.coinId === id) {
            asset.usdValue = usdPrice;
            asset.nairaValue = ngnPrice;
            asset.priceChange = price_change_24h;
            asset.percentageChange = price_change_percentage_24h;
            asset.image = image;
            asset.assetWorth = asset.balance * usdPrice;
            asset.assetNairaWorth = asset.balance * ngnPrice;
          }
          totalUSDValue += asset.assetWorth;
          totalNairaValue += asset.assetNairaWorth;
        }

        user.totalBalance = totalUSDValue;
        user.totalNairaValue = totalNairaValue;

        await user.save();
      }
    }));

    console.log('Asset values and total balances updated successfully.');
  } catch (error) {
    console.error('Error updating asset values:', error.message);
  }
};

export const updateCryptos = cron.schedule('*/1 * * * *', updateAssetValues);
