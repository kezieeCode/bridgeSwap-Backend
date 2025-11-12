import { Request, Response, NextFunction } from 'express';
import { validateEvmBalanceRequest } from '../validators/blockchainValidators';
import { fantomRpcService } from '../../services/fantomRpcService';

export const getFantomBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = validateEvmBalanceRequest(req);
    const balance = await fantomRpcService.getBalance(address);
    res.json({ address, balance });
  } catch (error) {
    next(error);
  }
};

