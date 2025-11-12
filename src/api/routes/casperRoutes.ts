import { Router } from 'express';
import { getCasperBalance } from '../controllers/casperController';

const router = Router();

router.post('/balance', getCasperBalance);

export const casperRoutes = router;

