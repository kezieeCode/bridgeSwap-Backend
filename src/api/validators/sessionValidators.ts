import { Request } from 'express';
import { ForwardRequestPayload } from '../../services/walletconnectService';

export interface CreateSessionDto {
  relayProtocol?: string;
  chains?: string[];
  methods?: string[];
}

export const validateCreateSession = (req: Request): CreateSessionDto => {
  const { relayProtocol, chains, methods } = req.body ?? {};

  if (relayProtocol && typeof relayProtocol !== 'string') {
    throw new Error('relayProtocol must be a string');
  }

  if (chains && (!Array.isArray(chains) || chains.some((chain) => typeof chain !== 'string'))) {
    throw new Error('chains must be an array of strings');
  }

  if (
    methods &&
    (!Array.isArray(methods) || methods.some((method) => typeof method !== 'string'))
  ) {
    throw new Error('methods must be an array of strings');
  }

  return {
    relayProtocol,
    chains,
    methods
  };
};

export const validateForwardPayload = (req: Request): ForwardRequestPayload => {
  const { method, params, chainId } = req.body ?? {};

  if (!method || typeof method !== 'string') {
    throw new Error('method is required');
  }

  if (!['eth_sendTransaction', 'personal_sign'].includes(method)) {
    throw new Error(`Unsupported method ${method}`);
  }

  if (!Array.isArray(params)) {
    throw new Error('params must be an array');
  }

  if (!chainId || typeof chainId !== 'string') {
    throw new Error('chainId is required and must be a string');
  }

  const allowedMethod = method as ForwardRequestPayload['method'];

  return {
    method: allowedMethod,
    params,
    chainId
  };
};

