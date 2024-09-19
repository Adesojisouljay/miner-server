import express from 'express';
import { getCrytpoData, getSingleNews } from '../controllers/crptoLogics.js';

const router = express.Router();

router.get('/', getCrytpoData);
router.get('/news/:id', getSingleNews);

export default router;
