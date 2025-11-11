import { Router } from 'express';
import { getBscBalance } from '../controllers/bscController';

const router = Router();

router.post('/balance', getBscBalance);

export const bscRoutes = router;

