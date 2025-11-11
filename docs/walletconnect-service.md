# WalletConnect Service

## Overview

This Node.js/TypeScript service exposes REST APIs for a Flutter client to initiate WalletConnect v2 sessions, monitor approvals, and proxy Ethereum RPC calls (`eth_sendTransaction`, `personal_sign`). It persists session state in Supabase so that multiple instances can share the same state.

## Environment

Copy `config/env/example.env` to `.env` and populate the following variables:

- `PORT` – HTTP port (default `4000`).
- `SUPABASE_URL` – Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY` – service role key used for database access.
- `WALLETCONNECT_PROJECT_ID` – WalletConnect Cloud project id.
- `WALLETCONNECT_RELAY_URL` – Relay server URL (`wss://relay.walletconnect.com`).
- `SESSION_REQUIRED_CHAINS` – Comma separated CAIP-2 chain ids (`eip155:1`).
- `SESSION_REQUIRED_METHODS` – Supported RPC methods (`eth_sendTransaction,personal_sign`).
- `BSC_RPC_URL` – HTTPS endpoint for a trusted BSC JSON-RPC node.

Run migrations in `supabase/migrations` to provision the `wallet_sessions` table:

```sh
supabase db push
```

## Development

```sh
npm install
cp config/env/example.env .env
npm run dev
```

## REST API

- `POST /api/wallet/session`
  - Optionally supply `relayProtocol`, `chains[]`, `methods[]`.
  - Returns `{ sessionId, uri }`.

- `GET /api/wallet/session/:id`
  - Returns the persisted session document with approval status.

- `POST /api/wallet/session/:id/request`
  - Body: `{ method: 'eth_sendTransaction' | 'personal_sign', params: [], chainId }`.
  - Proxies the RPC call through WalletConnect and returns `{ result }`.

- `POST /api/bsc/balance`
  - Body: `{ "address": "0x..." }`.
  - Returns `{ address, balance }` where `balance` is the hex-encoded wei balance from the configured BSC RPC.

## Testing

```sh
npm run test
```

Unit tests mock the WalletConnect client and Supabase repository to confirm session creation and request forwarding flows.

