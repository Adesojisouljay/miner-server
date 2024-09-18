import express from 'express';
import { 
    getUserTransactions, 
    getAllTransactions, 
    sellAsset, 
    buyAsset, 
    calculateTransaction, 
    fiatTransfer, 
    getConversionRate,
    swapAsset
} from "../controllers/transaction.js";
import { authMiddleware, isAdminMiddleware } from '../middleware/authMiddleWare.js';


const router = express.Router();

router.get('/', authMiddleware, getUserTransactions);
router.post('/buy', authMiddleware, buyAsset);
router.post('/sell', authMiddleware, sellAsset);
router.get('/fee', authMiddleware, calculateTransaction);
router.get('/all', getAllTransactions);
router.post('/fiat-transfer', authMiddleware, fiatTransfer);
router.post('/swap',authMiddleware, swapAsset); 
router.post('/swap/conversion-rate', getConversionRate); 

export default router;
