import { Request, Response, NextFunction } from 'express';
import { bscRpcService } from '../../services/bscRpcService';
import { validateBscBalanceRequest } from '../validators/blockchainValidators';

export const getBscBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = validateBscBalanceRequest(req);
    const balance = await bscRpcService.getBalance(address);
    res.json({ address, balance });
  } catch (error) {
    next(error);
  }
};

