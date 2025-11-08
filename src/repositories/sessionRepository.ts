import { getSupabaseClient } from '../services/supabaseClient';
import { SessionStatus, WalletSession } from '../types/session';

const TABLE_NAME = 'wallet_sessions';

export interface SessionRecord {
  id: string;
  pairing_topic: string | null;
  relay_protocol: string;
  status: SessionStatus;
  wallet_topic?: string | null;
  wallet_accounts?: string[] | null;
  wallet_metadata?: Record<string, unknown> | null;
  expiry?: number | null;
  created_at: string;
  updated_at: string;
}

const mapRecordToSession = (record: SessionRecord): WalletSession => ({
  id: record.id,
  pairingTopic: record.pairing_topic ?? undefined,
  relayProtocol: record.relay_protocol,
  status: record.status,
  wallet: {
    topic: record.wallet_topic ?? undefined,
    accounts: record.wallet_accounts ?? undefined,
    metadata: (record.wallet_metadata as WalletSession['wallet']['metadata']) ?? undefined
  },
  expiry: record.expiry ?? undefined,
  createdAt: record.created_at,
  updatedAt: record.updated_at
});

export const sessionRepository = {
  async create(session: WalletSession): Promise<void> {
    const client = getSupabaseClient();
    const { error } = await client.from(TABLE_NAME).insert({
      id: session.id,
      pairing_topic: session.pairingTopic ?? null,
      relay_protocol: session.relayProtocol,
      status: session.status,
      wallet_topic: session.wallet.topic ?? null,
      wallet_accounts: session.wallet.accounts ?? null,
      wallet_metadata: session.wallet.metadata ?? null,
      expiry: session.expiry ?? null,
      created_at: session.createdAt,
      updated_at: session.updatedAt
    });

    if (error) {
      throw new Error(`Failed to insert session: ${error.message}`);
    }
  },

  async update(
    id: string,
    updates: Partial<Omit<WalletSession, 'id' | 'createdAt'>> & { status?: SessionStatus }
  ): Promise<void> {
    const client = getSupabaseClient();
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (updates.pairingTopic !== undefined) {
      payload.pairing_topic = updates.pairingTopic ?? null;
    }
    if (typeof updates.relayProtocol === 'string') {
      payload.relay_protocol = updates.relayProtocol;
    }
    if (updates.status) {
      payload.status = updates.status;
    }
    if (updates.wallet) {
      if ('topic' in updates.wallet) {
        payload.wallet_topic = updates.wallet.topic ?? null;
      }
      if ('accounts' in updates.wallet) {
        payload.wallet_accounts = updates.wallet.accounts ?? null;
      }
      if ('metadata' in updates.wallet) {
        payload.wallet_metadata = updates.wallet.metadata ?? null;
      }
    }

    if (typeof updates.expiry === 'number') {
      payload.expiry = updates.expiry;
    }

    const { error } = await client.from(TABLE_NAME).update(payload).eq('id', id);

    if (error) {
      throw new Error(`Failed to update session ${id}: ${error.message}`);
    }
  },

  async findById(id: string): Promise<WalletSession | null> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch session ${id}: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return mapRecordToSession(data as SessionRecord);
  },

  async findByWalletTopic(topic: string): Promise<WalletSession | null> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from(TABLE_NAME)
      .select('*')
      .eq('wallet_topic', topic)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch session by wallet topic ${topic}: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return mapRecordToSession(data as SessionRecord);
  }
};

