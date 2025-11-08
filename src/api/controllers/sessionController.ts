import { Request, Response, NextFunction } from 'express';
import { walletconnectService } from '../../services/walletconnectService';
import { validateCreateSession, validateForwardPayload } from '../validators/sessionValidators';

export const createSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = validateCreateSession(req);
    const session = await walletconnectService.createSession(dto);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

export const getSessionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const session = await walletconnectService.getSession(id);
    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }
    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const forwardRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const payload = validateForwardPayload(req);
    const result = await walletconnectService.forwardRequest(id, payload);
    res.json({ result });
  } catch (error) {
    next(error);
  }
};

