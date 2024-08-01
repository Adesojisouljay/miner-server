import express from 'express';
import { 
     deposit,
     confirmDeposit,
     cancelDeposit,
     getAllDeposits,
     createNairaDepositRequest,
     confirmNairaDepositRequest,
     cancelNairaDepositRequest
 } from '../controllers/deposit.js';
import { authMiddleware, isAdminMiddleware  } from '../middleware/authMiddleWare.js';

const router = express.Router();

router.post('/',authMiddleware, deposit);
router.get('/', getAllDeposits);
router.put('/confirm/:depositId', authMiddleware, isAdminMiddleware, confirmDeposit);
router.put('/cancel/:depositId', authMiddleware, isAdminMiddleware, cancelDeposit);

/// NAIRA DEPOSIT
router.post('/naira-deposit', authMiddleware, createNairaDepositRequest);
router.post('/naira-deposit/confirm', authMiddleware, isAdminMiddleware, confirmNairaDepositRequest);
router.post('/naira-deposit/cancel', authMiddleware, isAdminMiddleware, cancelNairaDepositRequest);

export default router;
