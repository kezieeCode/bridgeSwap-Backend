/* eslint-disable no-console */
type LogLevel = 'info' | 'warn' | 'error';

const log = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
  const payload = meta ? ` ${JSON.stringify(meta)}` : '';
  console[level](`[${new Date().toISOString()}] ${message}${payload}`);
};

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta)
};

