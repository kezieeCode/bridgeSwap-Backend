create table if not exists wallet_sessions (
  id uuid primary key,
  pairing_topic text,
  relay_protocol text not null,
  status text not null check (status in ('pending', 'approved', 'expired', 'rejected')),
  wallet_topic text,
  wallet_accounts text[],
  wallet_metadata jsonb,
  expiry bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists wallet_sessions_wallet_topic_idx on wallet_sessions (wallet_topic);

