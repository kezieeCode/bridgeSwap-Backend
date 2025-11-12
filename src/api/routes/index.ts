import { Router } from 'express';
import { sessionRoutes } from './sessionRoutes';
import { bscRoutes } from './bscRoutes';
import { ethRoutes } from './ethRoutes';

const router = Router();

router.use('/wallet/session', sessionRoutes);
router.use('/bsc', bscRoutes);
router.use('/eth', ethRoutes);

export const apiRouter = router;

