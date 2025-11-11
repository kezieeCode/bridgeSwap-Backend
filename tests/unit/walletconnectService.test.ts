import type { SessionTypes } from '@walletconnect/types';

jest.mock('@walletconnect/sign-client', () => ({
  __esModule: true,
  default: {
    init: jest.fn()
  }
}));

jest.mock('../../src/repositories/sessionRepository', () => ({
  sessionRepository: {
    create: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    findByWalletTopic: jest.fn()
  }
}));

jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
process.env.WALLETCONNECT_PROJECT_ID = 'project-id';
process.env.WALLETCONNECT_RELAY_URL = 'wss://relay.walletconnect.com';
process.env.BSC_RPC_URL = process.env.BSC_RPC_URL ?? 'https://bsc-dataseed.binance.org';

const SignClient = require('@walletconnect/sign-client').default;
const { sessionRepository } = require('../../src/repositories/sessionRepository');
const { walletconnectService } = require('../../src/services/walletconnectService');

describe('walletconnectService', () => {
  const connectMock = jest.fn();
  const onMock = jest.fn();
  const requestMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    SignClient.init.mockResolvedValue({
      connect: connectMock,
      on: onMock,
      request: requestMock
    });
  });

  const flushAsync = () => new Promise((resolve) => setImmediate(resolve));

  it('creates a new session and stores it as pending', async () => {
    const approvalSession: SessionTypes.Struct = {
      acknowledged: true,
      controller: 'controller',
      expiry: 123,
      pairingTopic: 'pairing-topic',
      requiredNamespaces: {},
      self: {
        publicKey: 'publicKey',
        metadata: {
          name: 'App',
          description: '',
          url: '',
          icons: []
        }
      },
      peer: {
        publicKey: 'peer-key',
        metadata: {
          name: 'Sample Wallet',
          description: 'Wallet',
          url: 'https://wallet.example',
          icons: []
        }
      },
      topic: 'approved-topic',
      relay: { protocol: 'irn', data: undefined },
      namespaces: {
        eip155: {
          accounts: ['eip155:1:0x123'],
          methods: ['personal_sign'],
          events: []
        }
      },
      optionalNamespaces: {},
      sessionProperties: {}
    };

    connectMock.mockResolvedValue({
      uri: 'wc:mock-uri',
      approval: () => Promise.resolve(approvalSession),
      topic: 'pairing-topic'
    });

    const response = await walletconnectService.createSession();

    expect(response.uri).toBe('wc:mock-uri');
    expect(typeof response.sessionId).toBe('string');
    expect(sessionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: response.sessionId,
        status: 'pending'
      })
    );

    await flushAsync();

    expect(sessionRepository.update).toHaveBeenCalledWith(response.sessionId, {
      status: 'approved',
      pairingTopic: 'pairing-topic',
      wallet: {
        topic: 'approved-topic',
        accounts: ['eip155:1:0x123'],
        metadata: approvalSession.peer.metadata
      },
      expiry: 123
    });
  });

  it('forwards a request when the session is approved', async () => {
    const sessionId = 'session-id';
    sessionRepository.findById.mockResolvedValue({
      id: sessionId,
      pairingTopic: 'pair',
      relayProtocol: 'irn',
      status: 'approved',
      wallet: {
        topic: 'approved-topic',
        accounts: ['eip155:1:0xabc'],
        metadata: {}
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiry: 999
    });

    const mockResult = { hash: '0xdeadbeef' };
    requestMock.mockResolvedValue(mockResult);

    const result = await walletconnectService.forwardRequest(sessionId, {
      chainId: 'eip155:1',
      method: 'eth_sendTransaction',
      params: []
    });

    expect(requestMock).toHaveBeenCalledWith({
      topic: 'approved-topic',
      chainId: 'eip155:1',
      request: {
        method: 'eth_sendTransaction',
        params: []
      }
    });
    expect(result).toEqual(mockResult);
  });
});

