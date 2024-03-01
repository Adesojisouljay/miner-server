// controllers/userController.js

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/Users.js';

export const register = async (req, res) => {
  try {
    const { email, password, walletAddress } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      walletAddress,
      balance: 0
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
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({ success: true, token, user });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

// Fetch user profile
export const profile = async (req, res) => {
  try {
    console.log(req.user.userId)
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { email, password, walletAddress } = req.body;
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
    if (walletAddress && walletAddress !== currentUser.walletAddress) {

      const existingWalletUser = await User.findOne({ walletAddress });
      if (existingWalletUser && existingWalletUser._id !== userId) {
        return res.status(400).json({ success: false, message: 'Wallet address already exists' });
      }
      updatedFields.walletAddress = walletAddress;
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
