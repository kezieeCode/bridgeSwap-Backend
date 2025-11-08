import { createApp } from './app';
import { config } from './config/environment';
import { logger } from './utils/logger';

const app = createApp();

app.listen(config.port, () => {
  logger.info(`WalletConnect service listening on port ${config.port}`);
});

