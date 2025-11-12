import { Router } from 'express';
import { sessionRoutes } from './sessionRoutes';
import { bscRoutes } from './bscRoutes';
import { ethRoutes } from './ethRoutes';
import { cronosRoutes } from './cronosRoutes';
import { fantomRoutes } from './fantomRoutes';
import { polygonRoutes } from './polygonRoutes';
import { casperRoutes } from './casperRoutes';

const router = Router();

router.use('/wallet/session', sessionRoutes);
router.use('/bsc', bscRoutes);
router.use('/eth', ethRoutes);
router.use('/cronos', cronosRoutes);
router.use('/fantom', fantomRoutes);
router.use('/polygon', polygonRoutes);
router.use('/casper', casperRoutes);

export const apiRouter = router;

