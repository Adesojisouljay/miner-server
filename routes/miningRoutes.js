import express from 'express';
import { startMining , transferMinedBalance, getUserMiningRecord } from '../controllers/mining.js';
import { authMiddleware } from '../middleware/authMiddleWare.js';

const router = express.Router();

router.post('/transfer', authMiddleware, transferMinedBalance);
router.post('/start', authMiddleware, startMining);
router.get('/:userId', getUserMiningRecord);

export default router;
