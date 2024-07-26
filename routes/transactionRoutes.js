import express from 'express';
import { getUserTransactions, getAllTransactions } from "../controllers/transaction.js";
import { authMiddleware, isAdminMiddleware } from '../middleware/authMiddleWare.js';


const router = express.Router();

router.get('/', authMiddleware, getUserTransactions);
router.get('/all', getAllTransactions);

export default router;
