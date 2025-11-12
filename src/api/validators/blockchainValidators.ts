import { Request } from 'express';

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export interface AddressBalanceDto {
  address: string;
}

export const validateEvmBalanceRequest = (req: Request): AddressBalanceDto => {
  const { address } = req.body ?? req.query ?? {};

  if (!address || typeof address !== 'string') {
    throw new Error('address is required');
  }

  if (!EVM_ADDRESS_REGEX.test(address)) {
    throw new Error('address must be a valid EVM checksum address');
  }

  return { address: address.toLowerCase() };
};

