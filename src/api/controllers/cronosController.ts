import { Request, Response, NextFunction } from 'express';
import { validateEvmBalanceRequest } from '../validators/blockchainValidators';
import { cronosRpcService } from '../../services/cronosRpcService';

export const getCronosBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = validateEvmBalanceRequest(req);
    const balance = await cronosRpcService.getBalance(address);
    res.json({ address, balance });
  } catch (error) {
    next(error);
  }
};

