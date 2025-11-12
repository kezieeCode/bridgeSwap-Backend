jest.mock('cross-fetch', () => jest.fn());

process.env.SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'service-role-key';
process.env.WALLETCONNECT_PROJECT_ID = process.env.WALLETCONNECT_PROJECT_ID ?? 'project-id';
process.env.WALLETCONNECT_RELAY_URL =
  process.env.WALLETCONNECT_RELAY_URL ?? 'wss://relay.walletconnect.com';
process.env.BSC_RPC_URL = process.env.BSC_RPC_URL ?? 'https://bsc-dataseed.binance.org';
process.env.ETH_RPC_URL = 'https://ethereum.publicnode.com';

import fetch from 'cross-fetch';
import { ethRpcService } from '../../src/services/ethRpcService';

const mockedFetch = fetch as unknown as jest.Mock;

describe('ethRpcService', () => {
  beforeEach(() => {
    mockedFetch.mockReset();
  });

  it('retrieves eth balance via RPC', async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        jsonrpc: '2.0',
        id: 1,
        result: '0x456'
      })
    });

    const balance = await ethRpcService.getBalance('0x0000000000000000000000000000000000000000');

    expect(mockedFetch).toHaveBeenCalledWith('https://ethereum.publicnode.com', expect.any(Object));
    expect(balance).toBe('0x456');
  });

  it('rejects unsupported methods', async () => {
    await expect(ethRpcService.forward('eth_blockNumber', [])).rejects.toThrow(
      'Method eth_blockNumber is not allowed'
    );
  });
});

