import express from 'express';
import { authMiddleware, isAdminMiddleware } from '../middleware/authMiddleWare.js';
import { submitKYC, approveKyc, rejectKyc, getAllKyc } from '../controllers/kyc.js';

const router = express.Router();

router.post('/submit', authMiddleware, submitKYC);
router.post('/approve/:kycId', authMiddleware, isAdminMiddleware, approveKyc);
router.post('/reject/:kycId', authMiddleware, isAdminMiddleware,rejectKyc);
router.get('/all', authMiddleware, isAdminMiddleware, getAllKyc);

export default router;
