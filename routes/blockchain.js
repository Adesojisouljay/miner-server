import express from 'express';
import { getFees, sendCrypto } from '../controllers/blockchain.js';
import { authMiddleware } from '../middleware/authMiddleWare.js';


const router = express.Router();

router.post('/send', authMiddleware, sendCrypto);
router.get('/fees/:coinId/:fromAddress?/:toAddress?', authMiddleware, getFees);
 
export default router;
