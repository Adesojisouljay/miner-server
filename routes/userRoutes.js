import express from 'express';
import {register, login, profile, updateProfile, updateRole, addBankAccount} from '../controllers/user.js';
import { authMiddleware, isAdminMiddleware } from '../middleware/authMiddleWare.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/add-account', authMiddleware, addBankAccount);
router.get('/profile', authMiddleware, profile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/update-role', authMiddleware, isAdminMiddleware, updateRole);

export default router;
