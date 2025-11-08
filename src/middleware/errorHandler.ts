import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

interface HttpError extends Error {
  status?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (error: HttpError, req: Request, res: Response, next: NextFunction) => {
  const status = error.status ?? 500;

  logger.error('Unhandled error', {
    path: req.path,
    status,
    error: error.message
  });

  res.status(status).json({
    message: error.message ?? 'Internal Server Error'
  });
};

