import express from 'express';
import { getUserTransactions, getAllTransactions, sellAsset, buyAsset, transferNairaBalance } from "../controllers/transaction.js";
import { authMiddleware, isAdminMiddleware } from '../middleware/authMiddleWare.js';


const router = express.Router();

router.get('/', authMiddleware, getUserTransactions);
router.post('/buy', authMiddleware, buyAsset);
router.post('/sell', authMiddleware, sellAsset);
router.get('/all', getAllTransactions);
router.post('/fiat-transfer', authMiddleware, transferNairaBalance);

export default router;
