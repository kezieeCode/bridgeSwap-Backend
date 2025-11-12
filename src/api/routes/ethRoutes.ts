import { Router } from 'express';
import { getEthBalance } from '../controllers/ethController';

const router = Router();

router.post('/balance', getEthBalance);

export const ethRoutes = router;

