import { Request, Response, NextFunction } from 'express';
import { validateEvmBalanceRequest } from '../validators/blockchainValidators';
import { polygonRpcService } from '../../services/polygonRpcService';

export const getPolygonBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = validateEvmBalanceRequest(req);
    const balance = await polygonRpcService.getBalance(address);
    res.json({ address, balance });
  } catch (error) {
    next(error);
  }
};

