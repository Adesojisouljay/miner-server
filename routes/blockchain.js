import express from 'express';
import { sendCrypto } from '../controllers/blockchain.js';

const router = express.Router();

router.post('/', sendCrypto);
 
export default router;
