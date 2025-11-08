export type SessionStatus = 'pending' | 'approved' | 'expired' | 'rejected';

export interface WalletSession {
  id: string;
  pairingTopic?: string;
  relayProtocol: string;
  status: SessionStatus;
  wallet: {
    topic?: string;
    accounts?: string[];
    metadata?: {
      name?: string;
      description?: string;
      url?: string;
      icons?: string[];
    };
  };
  expiry?: number;
  createdAt: string;
  updatedAt: string;
}

