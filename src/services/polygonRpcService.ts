import fetch from 'cross-fetch';
import { config } from '../config/environment';
import { logger } from '../utils/logger';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: unknown[];
}

interface JsonRpcSuccess<T> {
  jsonrpc: '2.0';
  id: number;
  result: T;
}

interface JsonRpcError {
  jsonrpc: '2.0';
  id: number;
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
}

type JsonRpcResponse<T> = JsonRpcSuccess<T> | JsonRpcError;

const ALLOWED_METHODS = new Set(['eth_getBalance']);

export const polygonRpcService = {
  async forward<T = unknown>(method: string, params: unknown[]): Promise<T> {
    if (!ALLOWED_METHODS.has(method)) {
      throw new Error(`Method ${method} is not allowed`);
    }

    const payload: JsonRpcRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params
    };

    const response = await fetch(config.polygonRpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const body = await response.text();
      logger.error('Polygon RPC request failed', {
        status: response.status,
        body
      });
      throw new Error(`Polygon RPC request failed with status ${response.status}`);
    }

    const data = (await response.json()) as JsonRpcResponse<T>;

    if ('error' in data) {
      logger.error('Polygon RPC responded with error', {
        code: data.error.code,
        message: data.error.message
      });
      throw new Error(`Polygon RPC error: ${data.error.message}`);
    }

    return data.result;
  },

  async getBalance(address: string): Promise<string> {
    const result = await this.forward<string>('eth_getBalance', [address, 'latest']);
    return result;
  }
};

