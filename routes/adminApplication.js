import express from 'express';
import { applyForAdmin } from '../controllers/adminApplication.js';

const router = express.Router();

router.post('/apply', applyForAdmin);

export default router;
