import { Request, Response, NextFunction } from 'express';
import { validateEvmBalanceRequest } from '../validators/blockchainValidators';
import { casperRpcService } from '../../services/casperRpcService';

export const getCasperBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = validateEvmBalanceRequest(req);
    const balance = await casperRpcService.getBalance(address);
    res.json({ address, balance });
  } catch (error) {
    next(error);
  }
};

