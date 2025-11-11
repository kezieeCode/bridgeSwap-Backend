jest.mock('cross-fetch', () => jest.fn());

process.env.SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'service-role-key';
process.env.WALLETCONNECT_PROJECT_ID = process.env.WALLETCONNECT_PROJECT_ID ?? 'project-id';
process.env.WALLETCONNECT_RELAY_URL =
  process.env.WALLETCONNECT_RELAY_URL ?? 'wss://relay.walletconnect.com';
process.env.BSC_RPC_URL = 'https://bsc-dataseed.binance.org';

import fetch from 'cross-fetch';
import { bscRpcService } from '../../src/services/bscRpcService';

const mockedFetch = fetch as unknown as jest.Mock;

describe('bscRpcService', () => {
  beforeEach(() => {
    mockedFetch.mockReset();
  });

  it('forwards eth_getBalance requests and returns result', async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        jsonrpc: '2.0',
        id: 1,
        result: '0x123'
      })
    });

    const balance = await bscRpcService.getBalance('0x0000000000000000000000000000000000000000');

    expect(mockedFetch).toHaveBeenCalledWith('https://bsc-dataseed.binance.org', expect.objectContaining({
      method: 'POST'
    }));
    expect(balance).toBe('0x123');
  });

  it('rejects unsupported methods', async () => {
    await expect(
      bscRpcService.forward('eth_sendRawTransaction', [])
    ).rejects.toThrow('Method eth_sendRawTransaction is not allowed');
  });
});

