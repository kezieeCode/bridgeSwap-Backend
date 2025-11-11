import { Router } from 'express';
import { sessionRoutes } from './sessionRoutes';
import { bscRoutes } from './bscRoutes';

const router = Router();

router.use('/wallet/session', sessionRoutes);
router.use('/bsc', bscRoutes);

export const apiRouter = router;

