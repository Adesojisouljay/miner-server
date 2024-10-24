import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/Users.js';
import { fetchCryptoData } from '../utils/cryptoUtils.js';
import CryptoData from '../models/CryptoData.js';
import { generateUserMemo, validatePassword } from '../utils/index.js';
import { transporter } from '../utils/nodemailer.js';
import { encryptPrivateKey } from '../utils/index.js';
import { createBtcWallet } from '../crypto/bitcoin/wallet.js';
import { createTronWallet } from '../crypto/tron/index.js';
import { trc20Tokens } from '../variables/trc20Tokens.js';
import { sendTrxFromHotWallet } from '../crypto/tron/helper.js';
import messages from '../variables/messages.js';
import { activitiesEmail } from '../utils/nodemailer.js';
import UAParser from "ua-parser-js"

const resetLink = `${process.env.FRONTEND_URL}/reset-password`;

export const register = async (req, res) => {
  try {
    const { email, password, username, firstName, lastName, otherName } = req.body;
    console.log(email)

    const memo = await generateUserMemo();

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: email },
        { username: username }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      username,
      firstName,
      lastName,
      otherName,
      assets: [
        {
          currency: 'hive',
          balance: 0,
          depositAddress: process.env.HIVE_ACC,
          memo,
          usdValue: 0,
          nairaValue: 0,
          asseUsdtWorth: 0,
          assetNairaWorth: 0,
          coinId: 'hive',
          symbol: 'hive',
          priceChangeUsd: 0,
          priceChangeNgn: 0,
          percentageChange: 0,
          image: null,
          privateKey: null
        },
        {
          currency: 'hbd',
          balance: 0,
          depositAddress: process.env.HIVE_ACC,
          memo,
          usdValue: 0,
          nairaValue: 0,
          asseUsdtWorth: 0,
          assetNairaWorth: 0,
          coinId: 'hive_dollar',
          symbol: 'hbd',
          priceChangeUsd: 0,
          priceChangeNgn: 0,
          percentageChange: 0,
          image: null,
          privateKey: null
        }
      ],
      nairaBalance: 0,
      totalUsdValue: 0,
      totalNairaValue: 0,
      userMemo: memo
    });

    await newUser.save();

    // const { usdData, ngnData } = await fetchCryptoData();
    const response = await CryptoData.findOne()

     const usdData = response?.usdData;
      const ngnData = response?.ngnData;
    console.log({ usdData, ngnData });

    newUser.assets.forEach(asset => {
      const cryptoInfoUSD = usdData.find(crypto => crypto.id === (asset.currency === 'hive' ? 'hive' : 'hive_dollar'));
      const cryptoInfoNGN = ngnData.find(crypto => crypto.id === (asset.currency === 'hive' ? 'hive' : 'hive_dollar'));
      if (cryptoInfoUSD) {
        asset.coinId = cryptoInfoUSD.id;
        asset.symbol = cryptoInfoUSD.symbol;
        asset.usdValue = cryptoInfoUSD.current_price;
        asset.priceChangeUsd = cryptoInfoUSD.price_change_24h;
        asset.priceChangeNgn = cryptoInfoNGN.price_change_24h;
        asset.percentageChange = cryptoInfoUSD.price_change_percentage_24h;
        asset.image = cryptoInfoUSD.image;
        asset.asseUsdtWorth = asset.usdValue * asset.balance;
      }
      if (cryptoInfoNGN) {
        asset.nairaValue = cryptoInfoNGN.current_price;
        asset.assetNairaWorth = asset.nairaValue * asset.balance;
      }
    });

    await newUser.save();

    const emailContent = messages.welcomeEmail(newUser.username);
    activitiesEmail(newUser.email, messages.welcomeSubject, emailContent);

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

     if (!identifier) {
      return res.status(400).json({ success: false, message: 'Email or username is required' });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email/username or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    const userWithoutPassword = {
      _id: user._id,
      email: user.email, 
      username: user.username,
      assets: user.assets,
      accounts: user.accounts, 
      nairaBalance: user.nairaBalance,
      totalUsdValue: user.totalUsdValue,
      totalNairaValue: user.totalNairaValue,
      role: user.role,
      createdAt: user.createdAt,
      balance: user.balance,
      firstName: user.firstName,
      lastName: user.lastName,
      otherName: user.otherName || "",
      kyc: user.kyc || {}
    };

    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const cleanedIpAddress = (ipAddress.includes('::ffff:') || ipAddress.includes('::')) 
        ? (ipAddress.split('::ffff:')[1] || ipAddress.split('::')[1]) 
        : ipAddress;

    const userAgent = req.headers['user-agent'];

    const parser = new UAParser();
    const parsedUserAgent = parser.setUA(userAgent).getResult();
    const deviceType = parsedUserAgent.device.vendor || 'Unknown Device';
    const deviceModel = parsedUserAgent.device.model || 'Unknown Model';
    const osName = parsedUserAgent.os.name || 'Unknown OS';
    const browserName = parsedUserAgent.browser.name || 'Unknown Browser';

    const emailContent = messages.loginDetectedEmail(
      user.username, 
      cleanedIpAddress, 
      `${deviceType} ${deviceModel} running ${osName} on ${browserName}`
    );
    activitiesEmail(user.email, messages.loginDetectedSubject, emailContent);

    res.status(200).json({ success: true, token, user: userWithoutPassword });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find().select('-password').lean();

    // Check if users are found
    if (!users) {
      return res.status(404).json({ success: false, message: 'No users found' });
    }

    // Send users list as response
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// Fetch user profile
export const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;
    res.status(200).json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const getReceiverProfile = async (req, res) => {
  const { identifier } = req.params;
  try {
    const receiver = await User.findOne({
      $or: [
        { email: identifier }, 
        { username: identifier },
        { _id: identifier }
      ]
    });

    console.log(receiver);

    if (!receiver) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const dataTosend = {
      username: receiver.username,
      firstName: receiver.firstName,
      lastName: receiver.lastName,
      otherName: receiver.otherName,
      email: receiver.email
    }

    res.status(200).json({ success: true, user: dataTosend });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { email, password, profileImage } = req.body;
    const userId = req.user.userId; 

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No user ID provided' });
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updatedFields = {};
    if (email && email !== currentUser.email) {

      const existingEmailUser = await User.findOne({ email });
      if (existingEmailUser && existingEmailUser._id !== userId) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
      updatedFields.email = email;
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedFields.password = hashedPassword;
    }
    if (profileImage) {
      updatedFields.profileImage = profileImage;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, { new: true });

    res.status(200).json({ success: true, message: 'User profile updated successfully', profileImage: updatedUser.profileImage });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { email, role } = req.body;
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No user ID provided' });
    }

    // Check if the user is an admin
    const requestingUser = await User.findById(userId);
    if (!requestingUser || requestingUser.role !== "admin") {
      return res.status(403).json({ success: false, message: 'Forbidden: User is not an admin' });
    }

    const userToUpdate = await User.findOne({ email });
    if (!userToUpdate) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    userToUpdate.role = role;
    await userToUpdate.save();

    res.status(200).json({ success: true, message: 'User role updated successfully', user: userToUpdate });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const addBankAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { accountNumber, accountName, bankName } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.kyc || user.kyc.kycStatus !== "Verified") {
      return res.status(400).json({ success: false, message: `Sorry, you haven't completed KYC`});
    }

    const id =`acc-${new Date().getTime()}`
    const newAccount = { id, accountNumber, accountName, bankName };

    user.accounts.push(newAccount);

    await user.save();

    res.status(200).json({ success: true, message: 'Bank account added successfully', accounts: user.accounts });
  } catch (error) {
    console.error('Error adding bank account:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const deleteBankAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { accountId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const accountIndex = user.accounts.findIndex(account => account.id === accountId);

    if (accountIndex === -1) {
      return res.status(404).json({ success: false, message: 'Bank account not found' });
    }

    user.accounts.splice(accountIndex, 1); // Remove the account from the array

    await user.save();

    res.status(200).json({ success: true, message: 'Bank account deleted successfully', accounts: user.accounts });
  } catch (error) {
    console.error('Error deleting bank account:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate 6-digit token
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000;

    user.token = resetToken;
    user.tokenExpires = resetTokenExpiry;

    await user.save();

    const emailContent = messages.sendPasswordResetToken(user.username, resetToken);

    activitiesEmail(user.email, messages.passwordResetSubject, emailContent);

    res.status(200).json({ success: true, message: 'Password reset code has been sent to your email' });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    console.log("object", token, newPassword)

    const user = await User.findOne({
      token: token,
      tokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.token = undefined;
    user.tokenExpires = undefined;

    await user.save();

    res.status(200).json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const addUserAsset = async (req, res) => {
  try {
    const { coinId } = req.body;
    const userId = req.user.userId;
    console.log(coinId)
    
    const user = await User.findById(userId);

    if (!coinId) {
      return res.status(404).json({ success: false, message: 'Please provide coinId' });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.assets.some(asset => asset.coinId === coinId)) {
      return res.status(400).json({ success: false, message: 'Asset already exists' });
    }

      const response = await CryptoData.findOne()

     const usdData = response?.usdData;
      const ngnData = response?.ngnData;

      const cryptoInfoUSD = usdData?.find(crypto => crypto.id === coinId);
      const cryptoInfoNGN = ngnData?.find(crypto => crypto.id === coinId);

      const existingTrc20Asset = user.assets.find(asset => trc20Tokens.includes(asset.coinId));

     ////Logic for creating account should be here later
     let address;
     let privateKey;
     let encryptedPrivateKey;

     ///we will use this for addresses that requires mamo
    let memo = await generateUserMemo();

     if(coinId === "bitcoin") {
      const bitcoinWallet = createBtcWallet();
  
       address = bitcoinWallet.address;
       privateKey = bitcoinWallet.privateKey;
       encryptedPrivateKey = encryptPrivateKey(privateKey);
       memo = ""
    } else if (coinId === "hive" || coinId === "hive_dollar") {
        address = "";
        privateKey = "";
        encryptedPrivateKey = "";
        memo = memo

    } else if (trc20Tokens.includes(coinId)) {
      if (existingTrc20Asset) {
        address = existingTrc20Asset.depositAddress;
        privateKey = existingTrc20Asset.privateKey;
        encryptedPrivateKey = existingTrc20Asset.privateKey;
        memo = "";
      } else {
        const trxWallet = await createTronWallet();
        address = trxWallet.address;
        privateKey = trxWallet.privateKey;
        encryptedPrivateKey = encryptPrivateKey(privateKey);
        memo = "";

        ////might need to handle this properly, but we need to activate trx address for users, lets keep this for testing sake
        sendTrxFromHotWallet("tron", address, 0.1)
      }
    } else {
      //////but we needd to check for some edge cases where other coin requires memo
        address = "";
        privateKey = "";
        encryptedPrivateKey = "";
        memo = ""
    }

    const newAsset = {
      currency: coinId,
      balance: 0,
      depositAddress: address,
      memo: memo ? memo : "", ///////we will add memo for coin that requires memo
      usdValue: cryptoInfoUSD ? cryptoInfoUSD.current_price : 0,
      nairaValue: cryptoInfoNGN ? cryptoInfoNGN.current_price : 0,
      asseUsdtWorth: 0,
      assetNairaWorth: 0,
      coinId: cryptoInfoUSD ? cryptoInfoUSD.id : null,
      symbol: cryptoInfoUSD ? cryptoInfoUSD.symbol : null,
      priceChangeUsd: cryptoInfoUSD ? cryptoInfoUSD.price_change_24h : 0,
      priceChangeNgn: cryptoInfoNGN ? cryptoInfoNGN.price_change_24h : 0,
      percentageChange: cryptoInfoUSD ? cryptoInfoUSD.price_change_percentage_24h : 0,
      image: cryptoInfoUSD ? cryptoInfoUSD.image : null,
      privateKey: encryptedPrivateKey,
    };

    user.assets.push(newAsset);
    await user.save();

    res.status(200).json({ success: true, message: 'Asset added successfully', asset: newAsset });
  } catch (error) {
    console.error('Error adding asset:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const removeUserAsset = async (req, res) => {
  try {
    const { coinId } = req.body;
    const userId = req.user.userId;
    console.log("object....", coinId)

    const user = await User.findById(userId);

    if (!coinId) {
      return res.status(400).json({ success: false, message: 'Please provide coinId' });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const assetIndex = user.assets.findIndex(asset => asset.coinId === coinId);

    if (assetIndex === -1) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    user.assets.splice(assetIndex, 1);

    await user.save();

    res.status(200).json({ success: true, message: 'Asset removed successfully' });
  } catch (error) {
    console.error('Error removing asset:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

////might not be needed again because i added this logic to add asset func
export const generateWalletAddress = async (req, res) => {
  try {
    const { userId } = req.user;
    const { coinId } = req.body;
    console.log("object....", coinId)

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const asset = user.assets.find(asset => asset.coinId === coinId);

    if (!asset) {
      return res.status(400).json({ success: false, message: 'Asset not found' });
    }

    let address;
    let privateKey;
    let encryptedPrivateKey;

    ///we will use this for addresses that requires mamo
    const memo = await generateUserMemo();

    if(coinId === "bitcoin") {
      const bitcoinWallet = createBtcWallet();
  
       address = bitcoinWallet.address;
       privateKey = bitcoinWallet.privateKey;
       encryptedPrivateKey = encryptPrivateKey(privateKey);
    } else{
      return res.status(400).json({ success: false, message: 'Address not available' });
    }

    asset.depositAddress = address;
    asset.privateKey = encryptedPrivateKey;

    await user.save();

    res.status(200).json({ success: true, message: 'Wallet address added successfully' });
  } catch (error) {
    console.error('Error adding wallet address:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

