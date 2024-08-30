import express from 'express';
import { getCrytpoData } from '../controllers/crptoLogics.js';

const router = express.Router();

router.get('/', getCrytpoData);

export default router;
