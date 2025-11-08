import { Router } from 'express';
import { sessionRoutes } from './sessionRoutes';

const router = Router();

router.use('/wallet/session', sessionRoutes);

export const apiRouter = router;

