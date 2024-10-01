import express from 'express';
import { sendCrypto } from '../controllers/blockchain.js';
import { authMiddleware, isAdminMiddleware } from '../middleware/authMiddleWare.js';


const router = express.Router();

router.post('/send', authMiddleware, sendCrypto);
 
export default router;
