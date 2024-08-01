import express from 'express';
import { 
    createMerchant,
    getAllMerchants,
    getMerchantById,
    updateMerchant,
    deleteMerchant,
    approveMerchant,
    disapproveMerchant,
    getRandomMerchant
 } from '../controllers/merchant.js';
 import { authMiddleware, isAdminMiddleware } from '../middleware/authMiddleWare.js'; 

const router = express.Router();

router.post('/apply', authMiddleware, createMerchant);
router.get('/', authMiddleware, getAllMerchants);
router.get('/:id', authMiddleware, getMerchantById);
router.put('/:id', authMiddleware, updateMerchant);
router.delete('/:id', authMiddleware, deleteMerchant);
router.patch('/:id/approve', authMiddleware, isAdminMiddleware, approveMerchant);
router.patch('/:id/cancel', authMiddleware, isAdminMiddleware, disapproveMerchant);
router.get('/generate/account', authMiddleware, getRandomMerchant);

export default router;
