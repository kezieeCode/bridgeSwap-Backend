import { Router } from 'express';
import { getCronosBalance } from '../controllers/cronosController';

const router = Router();

router.post('/balance', getCronosBalance);

export const cronosRoutes = router;

