import { Router } from 'express';
import { createSession, getSessionStatus, forwardRequest } from '../controllers/sessionController';

const router = Router();

router.post('/', createSession);
router.get('/:id', getSessionStatus);
router.post('/:id/request', forwardRequest);

export const sessionRoutes = router;

