import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'WALLETCONNECT_PROJECT_ID',
  'WALLETCONNECT_RELAY_URL',
  'BSC_RPC_URL',
  'ETH_RPC_URL'
] as const;

type RequiredEnvKey = (typeof requiredEnv)[number];

const getEnv = (key: RequiredEnvKey): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const config = {
  port: Number(process.env.PORT ?? 4000),
  supabaseUrl: getEnv('SUPABASE_URL'),
  supabaseServiceKey: getEnv('SUPABASE_SERVICE_ROLE_KEY'),
  walletconnectProjectId: getEnv('WALLETCONNECT_PROJECT_ID'),
  walletconnectRelayUrl: getEnv('WALLETCONNECT_RELAY_URL'),
  bscRpcUrl: getEnv('BSC_RPC_URL'),
  ethRpcUrl: getEnv('ETH_RPC_URL'),
  requiredChains: (process.env.SESSION_REQUIRED_CHAINS ?? 'eip155:1')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
  requiredMethods: (process.env.SESSION_REQUIRED_METHODS ??
    'eth_sendTransaction,personal_sign')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
};

