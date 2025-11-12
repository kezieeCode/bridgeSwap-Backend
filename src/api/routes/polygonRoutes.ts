import { Router } from 'express';
import { getPolygonBalance } from '../controllers/polygonController';

const router = Router();

router.post('/balance', getPolygonBalance);

export const polygonRoutes = router;

