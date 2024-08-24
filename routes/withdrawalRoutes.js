import express from 'express';
import { 
    processHiveWithdrawal, 
    initiateWithdrawal, 
    confirmWithdrawal, 
    getAllWithdrawals, 
    cancelWithdrawal, 
    requestWithdrawalToken ,
    requestFiatWithdrawal,
    confirmFiatWithdrawal,
    cancelFiatWithdrawal,
    getAllFiatWithdrawals
} from '../controllers/withdrawal.js';
import { authMiddleware, isAdminMiddleware } from '../middleware/authMiddleWare.js';

const router = express.Router();

// router.post('/', withdraw);
router.post('/hive', authMiddleware, processHiveWithdrawal);
router.post('/request-token', authMiddleware, requestWithdrawalToken);
router.post('/fiat/init', authMiddleware, requestFiatWithdrawal);
router.post('/fiat/confirm', authMiddleware, isAdminMiddleware, confirmFiatWithdrawal);
router.post('/fiat/cancel', authMiddleware, isAdminMiddleware, cancelFiatWithdrawal);
router.get('/fiat', authMiddleware, isAdminMiddleware, getAllFiatWithdrawals);

/////////////////////
router.post('/initiate', authMiddleware, initiateWithdrawal);
router.get('/', getAllWithdrawals);
router.put('/confirm/:withdrawalId', authMiddleware, isAdminMiddleware, confirmWithdrawal);  
router.put('/cancel/:withdrawalId', authMiddleware, isAdminMiddleware, cancelWithdrawal);    

export default router;
