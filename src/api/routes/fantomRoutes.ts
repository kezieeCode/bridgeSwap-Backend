import { Router } from 'express';
import { getFantomBalance } from '../controllers/fantomController';

const router = Router();

router.post('/balance', getFantomBalance);

export const fantomRoutes = router;

