import express from 'express';
import { deposit, confirmDeposit, cancelDeposit, getAllDeposits } from '../controllers/deposit.js';
import { authMiddleware, isAdminMiddleware } from '../middleware/authMiddleWare.js';

const router = express.Router();

router.post('/',authMiddleware, deposit);
router.get('/', getAllDeposits);
router.put('/confirm/:depositId', authMiddleware, isAdminMiddleware, confirmDeposit);
router.put('/cancel/:depositId', authMiddleware, isAdminMiddleware, cancelDeposit);

export default router;
