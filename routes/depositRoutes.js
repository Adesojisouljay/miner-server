import express from 'express';
import { 
     deposit,
     confirmDeposit,
     cancelDeposit,
     getAllDeposits,
     createNairaDepositRequest,
     confirmNairaDepositRequest,
     cancelNairaDepositRequest,
     getAllNairaDeposits,
     getNairaDepositById
 } from '../controllers/deposit.js';
import { authMiddleware, isAdminMiddleware  } from '../middleware/authMiddleWare.js';

const router = express.Router();

router.post('/',authMiddleware, deposit);
router.get('/', getAllDeposits);
router.put('/confirm/:depositId', authMiddleware, isAdminMiddleware, confirmDeposit);
router.put('/cancel/:depositId', authMiddleware, isAdminMiddleware, cancelDeposit);

/// NAIRA DEPOSIT
router.post('/fiat/deposit', authMiddleware, createNairaDepositRequest);
router.post('/fiat/confirm', authMiddleware, isAdminMiddleware, confirmNairaDepositRequest);
router.post('/fiat/cancel', authMiddleware, isAdminMiddleware, cancelNairaDepositRequest);
router.get('/fiat', authMiddleware, isAdminMiddleware, getAllNairaDeposits);
router.get('/fiat/:narration', getNairaDepositById);

export default router;
