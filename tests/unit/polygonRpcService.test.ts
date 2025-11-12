jest.mock('cross-fetch', () => jest.fn());

process.env.SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'service-role-key';
process.env.WALLETCONNECT_PROJECT_ID = process.env.WALLETCONNECT_PROJECT_ID ?? 'project-id';
process.env.WALLETCONNECT_RELAY_URL =
  process.env.WALLETCONNECT_RELAY_URL ?? 'wss://relay.walletconnect.com';
process.env.BSC_RPC_URL = process.env.BSC_RPC_URL ?? 'https://bsc-dataseed.binance.org';
process.env.ETH_RPC_URL = process.env.ETH_RPC_URL ?? 'https://ethereum.publicnode.com';
process.env.CRONOS_RPC_URL = process.env.CRONOS_RPC_URL ?? 'https://evm.cronos.org';
process.env.FANTOM_RPC_URL = process.env.FANTOM_RPC_URL ?? 'https://rpcapi.fantom.network';
process.env.POLYGON_RPC_URL = 'https://polygon-rpc.com';
process.env.CASPER_RPC_URL =
  process.env.CASPER_RPC_URL ?? 'https://rpc.mainnet.casperlabs.io/rpc';

import fetch from 'cross-fetch';
import { polygonRpcService } from '../../src/services/polygonRpcService';

const mockedFetch = fetch as unknown as jest.Mock;

describe('polygonRpcService', () => {
  beforeEach(() => {
    mockedFetch.mockReset();
  });

  it('retrieves polygon balance', async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        jsonrpc: '2.0',
        id: 1,
        result: '0xdef'
      })
    });

    const balance = await polygonRpcService.getBalance('0x0000000000000000000000000000000000000000');
    expect(mockedFetch).toHaveBeenCalledWith('https://polygon-rpc.com', expect.any(Object));
    expect(balance).toBe('0xdef');
  });
});

