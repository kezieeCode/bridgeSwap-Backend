import express from 'express';
import cors from 'cors';
import { apiRouter } from './api/routes';
import { errorHandler } from './middleware/errorHandler';

export const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api', apiRouter);
  app.use(errorHandler);
  return app;
};

