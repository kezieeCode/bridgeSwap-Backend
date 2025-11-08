import SignClient from '@walletconnect/sign-client';
import { SessionTypes } from '@walletconnect/types';
import { randomUUID } from 'crypto';
import { config } from '../config/environment';
import { sessionRepository } from '../repositories/sessionRepository';
import { SessionStatus, WalletSession } from '../types/session';
import { logger } from '../utils/logger';

export interface CreateSessionRequest {
  relayProtocol?: string;
  chains?: string[];
  methods?: string[];
}

export interface CreateSessionResponse {
  sessionId: string;
  uri: string;
}

export interface ForwardRequestPayload {
  method: 'eth_sendTransaction' | 'personal_sign';
  params: unknown[];
  chainId: string;
}

class WalletConnectService {
  private clientPromise: Promise<SignClient> | null = null;

  private async getClient(): Promise<SignClient> {
    if (!this.clientPromise) {
      this.clientPromise = this.initializeClient();
    }
    return this.clientPromise;
  }

  private async initializeClient(): Promise<SignClient> {
    const client = await SignClient.init({
      projectId: config.walletconnectProjectId,
      relayUrl: config.walletconnectRelayUrl,
      metadata: {
        name: 'Smart Backend WalletConnect Service',
        description: 'WalletConnect bridge for Flutter application',
        url: 'https://example.com',
        icons: ['https://walletconnect.com/walletconnect-logo.png']
      }
    });

    client.on('session_delete', async ({ topic }) => {
      await this.updateStatusByWalletTopic(topic, 'expired');
    });

    client.on('session_expire', async ({ topic }) => {
      await this.updateStatusByWalletTopic(topic, 'expired');
    });

    client.on('session_update', async (event) => {
      const { topic, params } = event;
      const session = await sessionRepository.findByWalletTopic(topic);
      if (!session) {
        return;
      }
      const accounts = params.namespaces?.eip155?.accounts ?? session.wallet.accounts;
      await sessionRepository.update(session.id, {
        wallet: {
          ...session.wallet,
          accounts
        }
      });
    });

    return client;
  }

  private async updateStatusByWalletTopic(topic: string, status: SessionStatus) {
    try {
      const session = await sessionRepository.findByWalletTopic(topic);
      if (!session) {
        return;
      }
      await sessionRepository.update(session.id, { status });
      logger.info(`Session ${session.id} marked as ${status}`, { topic });
    } catch (error) {
      logger.error('Failed to update session by topic', {
        topic,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  public async createSession(
    request: CreateSessionRequest = {}
  ): Promise<CreateSessionResponse> {
    const relayProtocol = request.relayProtocol ?? 'irn';
    const chains = request.chains ?? config.requiredChains;
    const methods = request.methods ?? config.requiredMethods;

    const client = await this.getClient();
    const { uri, approval } = await client.connect({
      requiredNamespaces: {
        eip155: {
          methods,
          chains,
          events: ['accountsChanged', 'chainChanged']
        }
      }
    });

    if (!uri) {
      throw new Error('Failed to generate WalletConnect URI');
    }

    const sessionId = randomUUID();
    const now = new Date().toISOString();
    const sessionRecord: WalletSession = {
      id: sessionId,
      pairingTopic: undefined,
      relayProtocol,
      status: 'pending',
      wallet: {},
      createdAt: now,
      updatedAt: now
    };

    await sessionRepository.create(sessionRecord);

    approval()
      .then(async (wcSession) => {
        await this.handleApproval(sessionId, wcSession);
      })
      .catch(async (error) => {
        logger.error('Wallet session approval failed', {
          sessionId,
          error: error instanceof Error ? error.message : String(error)
        });
        await sessionRepository.update(sessionId, { status: 'rejected' });
      });

    return { sessionId, uri };
  }

  private async handleApproval(id: string, wcSession: SessionTypes.Struct) {
    const accounts = wcSession.namespaces.eip155?.accounts ?? [];
    await sessionRepository.update(id, {
      status: 'approved',
      pairingTopic: wcSession.pairingTopic,
      wallet: {
        topic: wcSession.topic,
        accounts,
        metadata: wcSession.peer.metadata
      },
      expiry: wcSession.expiry
    });
    logger.info('Wallet session approved', { sessionId: id, topic: wcSession.topic });
  }

  public async getSession(sessionId: string): Promise<WalletSession | null> {
    return sessionRepository.findById(sessionId);
  }

  public async forwardRequest(
    sessionId: string,
    payload: ForwardRequestPayload
  ): Promise<unknown> {
    const client = await this.getClient();
    const session = await sessionRepository.findById(sessionId);

    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (session.status !== 'approved' || !session.wallet.topic) {
      throw new Error(`Session ${sessionId} is not ready for requests`);
    }

    if (!payload.chainId) {
      throw new Error('chainId is required to forward the request');
    }

    const response = await client.request({
      topic: session.wallet.topic,
      chainId: payload.chainId,
      request: {
        method: payload.method,
        params: payload.params
      }
    });

    logger.info('Forwarded request to wallet', {
      sessionId,
      method: payload.method
    });

    return response;
  }
}

export const walletconnectService = new WalletConnectService();

