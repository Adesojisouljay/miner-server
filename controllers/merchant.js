import Merchant from '../models/Merchant.js';
import User from '../models/Users.js';

export const createMerchant = async (req, res) => {
  try {
    const { username, accountNumber, accountName, bankName, residentialAddress, residencePicture, selfiePhotograph, NIN, BVN, socialMediaHandle } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.kyc || user.kyc.kycStatus !== "Verified") {
      return res.status(400).json({ success: false, message: `Sorry, you haven't completed KYC`});
    }

    const existingMerchant = await Merchant.findOne({ userId });
    if (existingMerchant) {
      return res.status(409).json({ success: false, message: 'Merchant account already exists for this user' });
    }
 
    const existingMerchantByUsername = await Merchant.findOne({ username });
    if (existingMerchantByUsername) {
      return res.status(409).json({ success: false, message: 'username is already in use' });
    }

    const existingMerchantByAccount = await Merchant.findOne({ accountNumber });
    if (existingMerchantByAccount) {
      return res.status(409).json({ success: false, message: 'Account number is already in use' });
    }

    const existingMerchantByNIN = await Merchant.findOne({ NIN });
    if (existingMerchantByNIN) {
      return res.status(409).json({ success: false, message: 'NIN is already in use' });
    }

    const existingMerchantByBVN = await Merchant.findOne({ BVN });
    if (existingMerchantByBVN) {
      return res.status(409).json({ success: false, message: 'BVN is already in use' });
    }

    const newMerchant = new Merchant({
      userId,
      username,
      accountNumber,
      accountName,
      bankName,
      residentialAddress,
      residencePicture,
      selfiePhotograph,
      NIN,
      BVN,
      socialMediaHandle
    });

    await newMerchant.save();

    res.status(201).json({ success: true, message: 'Merchant account created successfully', data: newMerchant });
  } catch (error) {
    console.error('Error creating merchant account:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const getAllMerchants = async (req, res) => {
  try {
    const merchants = await Merchant.find().populate('userId', 'email');
    res.status(200).json({ success: true, data: merchants });
  } catch (error) {
    console.error('Error fetching merchant accounts:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const getMerchantById = async (req, res) => {
  try {
    const { id } = req.params;
    const merchant = await Merchant.findById(id).populate('userId', 'email');
    if (!merchant) {
      return res.status(404).json({ success: false, message: 'Merchant account not found' });
    }
    res.status(200).json({ success: true, data: merchant });
  } catch (error) {
    console.error('Error fetching merchant account:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const updateMerchant = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, accountNumber, accountName, bankName, status, isActive } = req.body;

      if (!username && !accountNumber && !accountName && !bankName && status === undefined && isActive === undefined) {
        return res.status(400).json({ success: false, message: 'please rovided field for update' });
      }

    const updatedMerchant = await Merchant.findByIdAndUpdate(
      id,
      { username, accountNumber, accountName, bankName, status, isActive },
      { new: true }
    );

    if (!updatedMerchant) {
      return res.status(404).json({ success: false, message: 'Merchant account not found' });
    }

    res.status(200).json({ success: true, message: 'Merchant account updated successfully', data: updatedMerchant });
  } catch (error) {
    console.error('Error updating merchant account:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const deleteMerchant = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMerchant = await Merchant.findByIdAndDelete(id);

    if (!deletedMerchant) {
      return res.status(404).json({ success: false, message: 'Merchant account not found' });
    }

    res.status(200).json({ success: true, message: 'Merchant account deleted successfully' });
  } catch (error) {
    console.error('Error deleting merchant account:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const approveMerchant = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedMerchant = await Merchant.findByIdAndUpdate(
      id,
      { status: 'approved', isActive: true },
      { new: true }
    );

    if (!updatedMerchant) {
      return res.status(404).json({ success: false, message: 'Merchant account not found' });
    }

    res.status(200).json({ success: true, message: 'Merchant account approved successfully', data: updatedMerchant });
  } catch (error) {
    console.error('Error approving merchant account:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const disapproveMerchant = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedMerchant = await Merchant.findByIdAndUpdate(
      id,
      { status: 'cancelled', isActive: false },
      { new: true }
    );

    if (!updatedMerchant) {
      return res.status(404).json({ success: false, message: 'Merchant account not found' });
    }

    res.status(200).json({ success: true, message: 'Merchant account disapproved successfully', data: updatedMerchant });
  } catch (error) {
    console.error('Error disapproving merchant account:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const getRandomMerchant = async (req, res) => {
  try {
    const merchants = await Merchant.find({ status: 'approved', isActive: true });

    if (merchants.length === 0) {
      return res.status(404).json({ success: false, message: 'All our merchants are currently unavailable' });
    }

    const randomIndex = Math.floor(Math.random() * merchants.length);
    const selectedMerchant = merchants[randomIndex];

    const getShortenedNarration = () => {
      const prefix = 'FO';
      const surfix = 'OT';
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 characters
      return `${prefix}${randomPart}${surfix}`;
    };    

    const narration = getShortenedNarration();

    res.status(200).json({ success: true, data: selectedMerchant, narration });
  } catch (error) {
    console.error('Error fetching random merchant:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
