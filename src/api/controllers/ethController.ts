import { Request, Response, NextFunction } from 'express';
import { validateEvmBalanceRequest } from '../validators/blockchainValidators';
import { ethRpcService } from '../../services/ethRpcService';

export const getEthBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = validateEvmBalanceRequest(req);
    const balance = await ethRpcService.getBalance(address);
    res.json({ address, balance });
  } catch (error) {
    next(error);
  }
};

