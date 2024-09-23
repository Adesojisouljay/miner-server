import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/Users.js';
import { fetchCryptoData } from '../utils/cryptoUtils.js';
import { generateUserMemo, validatePassword } from '../utils/index.js';
import { transporter } from '../utils/nodemailer.js';
import { encryptPrivateKey } from '../utils/index.js';

const resetLink = `${process.env.FRONTEND_URL}/reset-password`;

export const register = async (req, res) => {
  try {
    const { email, password, username, firstName, lastName, otherName } = req.body;

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
    });

    await newUser.save();

    const { usdData, ngnData } = await fetchCryptoData();
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

    res.status(200).json({ success: true, token, user: userWithoutPassword });
  } catch (error) {
    console.error('Error logging in user:', error);
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
        { username: identifier }
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
    const { email, password, username } = req.body;
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
    if (username && username !== currentUser.username) {

      const existingWalletUser = await User.findOne({ username });
      if (existingWalletUser && existingWalletUser._id !== userId) {
        return res.status(400).json({ success: false, message: 'Wallet address already exists' });
      }
      updatedFields.username = username;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, { new: true });

    res.status(200).json({ success: true, message: 'User profile updated successfully', user: updatedUser });
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
 
    const mailOptions = {
      to: user.email,
      from: process.env.OUTLOOK_USER,
      subject: 'Password Reset',
      text: `Your password reset code is ${resetToken}. This code is valid for i5 minutes.\n\n
            You can reset your password by entering this code on the following page:\n\n${resetLink}\n\n
            If you did not request a password reset, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Password reset code has been sent to your email' });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

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

    const response = await fetchCryptoData();
    // const { usdData, ngnData } = response;
     const usdData = response?.usdData;
    const ngnData = response?.ngnData;

    const cryptoInfoUSD = usdData?.find(crypto => crypto.id === coinId);
    const cryptoInfoNGN = ngnData?.find(crypto => crypto.id === coinId);

    const memo = await generateUserMemo();

     ////Logic for creating account should be here later
    const address = "Tgrj8yiuyighhh0u09889uoihnkhh"
    const privKey ="testPrivekey"
    const encryptedPrivateKey = encryptPrivateKey(privKey)

    const depositAddress = ['hive', 'hbd'].includes(coinId.toLowerCase()) 
      ? process.env.HIVE_ACC 
      : address;

    const newAsset = {
      currency: coinId,
      balance: 0,
      depositAddress: "",
      memo,
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
      privateKey: "",
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
    const { currency } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const asset = user.assets.find(asset => asset.currency === currency);

    if (!asset) {
      return res.status(400).json({ success: false, message: 'Asset not found' });
    }

    const address = "Tgrj8yiuyighhh0u09889uoihnkhh"
    const privKey ="testPrivekey"
    const encryptedPrivateKey = encryptPrivateKey(privKey)

    asset.depositAddress = address;
    asset.privateKey = encryptedPrivateKey;

    await user.save();

    res.status(200).json({ success: true, message: 'Wallet address added successfully', asset });
  } catch (error) {
    console.error('Error adding wallet address:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

