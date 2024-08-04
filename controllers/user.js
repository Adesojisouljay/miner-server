import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/Users.js';
import { fetchCryptoData } from '../utils/coingecko.js';
import { generateUserMemo, validatePassword } from '../utils/index.js';  

export const register = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    const memo = await generateUserMemo()

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

    // const existingUser = await User.findOne({ email, username });
    
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      username,
      assets: [
        {
          currency: 'hive',
          balance: 0,
          depositAddress: process.env.HIVE_ACC,
          memo,
          usdValue: 0,
          nairaValue: 0,
          assetWorth: 0,
          assetNairaWorth: 0,
          coinId: null,
          symbol: null,
          priceChange: 0, 
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
          assetWorth: 0,
          assetNairaWorth: 0,
          coinId: null,
          symbol: null,
          priceChange: 0,
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
        asset.priceChange = cryptoInfoUSD.price_change_24h;
        asset.percentageChange = cryptoInfoUSD.price_change_percentage_24h;
        asset.image = cryptoInfoUSD.image;
        asset.assetWorth = asset.usdValue * asset.balance;
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
    const { email, password, username } = req.body;
    console.log(req.body.username)

     if (!email && !username) {
      return res.status(400).json({ success: false, message: 'Email or username is required' });
    }

    const searchQuery = email ? { email } : { username };
    console.log(searchQuery)

    const user = await User.findOne(searchQuery);
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
      nairaBalance: user.nairaBalance,
      totalUsdValue: user.totalUsdValue,
      totalNairaValue: user.totalNairaValue,
      role: user.role,
      createdAt: user.createdAt,
      balance: user.balance
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

    const newAccount = { accountNumber, accountName, bankName };

    user.accounts.push(newAccount);

    await user.save();

    res.status(200).json({ success: true, message: 'Bank account added successfully', accounts: user.accounts });
  } catch (error) {
    console.error('Error adding bank account:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
