import express from 'express';
import {register, 
    login, 
    profile, 
    updateProfile, 
    updateRole, 
    addBankAccount, 
    deleteBankAccount, 
    requestPasswordReset, 
    resetPassword,
    getReceiverProfile,
    addUserAsset,
    addWalletAddress
} from '../controllers/user.js';
import { authMiddleware, isAdminMiddleware } from '../middleware/authMiddleWare.js';
import { loginRateLimiter, logIpAddress } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', register);
router.post('/login',logIpAddress, loginRateLimiter, login);
router.post('/password-reset-token', authMiddleware, requestPasswordReset);
router.post('/password-reset', authMiddleware, resetPassword);
router.post('/add-account', authMiddleware, addBankAccount);
router.delete('/delete-account', authMiddleware, deleteBankAccount);
router.get('/profile', authMiddleware, profile); ////might not need auth for this
router.get('/receiver-profile/:identifier', getReceiverProfile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/update-role', authMiddleware, isAdminMiddleware, updateRole);
router.post('/add-asset', authMiddleware, addUserAsset);
router.put('/add-wallet-address', authMiddleware, addWalletAddress);


export default router;
