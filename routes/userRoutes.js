import express from 'express';
import {register, 
    login,
    getAllUsers,
    profile, 
    updateProfile, 
    updateRole, 
    addBankAccount, 
    deleteBankAccount, 
    requestPasswordReset, 
    resetPassword,
    getReceiverProfile,
    addUserAsset,
    removeUserAsset,
    generateWalletAddress
} from '../controllers/user.js';
import { authMiddleware, isAdminMiddleware } from '../middleware/authMiddleWare.js';
import { loginRateLimiter, logIpAddress } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', register);
router.post('/login',logIpAddress, loginRateLimiter, login);
router.get('/users', getAllUsers);
router.post('/password-reset-token', requestPasswordReset);
router.post('/password-reset', resetPassword);
router.post('/add-account', authMiddleware, addBankAccount);
router.delete('/delete-account', authMiddleware, deleteBankAccount);
router.get('/profile', authMiddleware, profile); ////might not need auth for this
router.get('/receiver-profile/:identifier', getReceiverProfile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/update-role', authMiddleware, isAdminMiddleware, updateRole);
router.post('/add-asset', authMiddleware, addUserAsset);
router.post('/remove-asset', authMiddleware, removeUserAsset);
router.put('/generate-address', authMiddleware, generateWalletAddress);


export default router;
