import { SupportedChainId } from "./chain";

type ChainEnvKeys = {
  [K in SupportedChainId]: K extends 31337
    ? {
        local: Record<keyof ChainEnvSchema, string>;
        forked: Record<keyof ChainEnvSchema, string>;
      }
    : Record<keyof ChainEnvSchema, string>;
};

type GlobalEnvSchema = {
  WALLET_CONNECT_PROJECT_ID: string;
  INFURA_API_KEY: string;
  ANVIL_FORKED: boolean;
};

type ChainEnvSchema = {
  VAULT_ADDRESS: string;
  UNDERLYING_TOKEN: string;
  RPC_URL: string;
};

const GLOBAL_ENV_KEYS = {
  WALLET_CONNECT_PROJECT_ID:
    process.env["NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"],
  INFURA_API_KEY: process.env["NEXT_PUBLIC_INFURA_API_KEY"],
  ANVIL_FORKED: process.env["NEXT_PUBLIC_ANVIL_FORKED"] === "true",
};

const CHAIN_ENV_KEYS: ChainEnvKeys = {
  84532: {
    VAULT_ADDRESS: process.env["NEXT_PUBLIC_BASE_SEPOLIA_VAULT_ADDRESS"]!,
    UNDERLYING_TOKEN: process.env["NEXT_PUBLIC_BASE_SEPOLIA_UNDERLYING_TOKEN"]!,
    RPC_URL: process.env["NEXT_PUBLIC_RPC_BASE_SEPOLIA"]!,
  },
  31337: {
    local: {
      VAULT_ADDRESS: process.env["NEXT_PUBLIC_VAULT_ADDRESS"]!,
      UNDERLYING_TOKEN: process.env["NEXT_PUBLIC_ANVIL_UNDERLYING_TOKEN"]!,
      RPC_URL: process.env["NEXT_PUBLIC_RPC_ANVIL"]!,
    },
    forked: {
      // WORLDCHAIN FORKED ON ANVIL
      VAULT_ADDRESS: process.env["NEXT_PUBLIC_FORKED_VAULT_ADDRESS_WC"]!,
      UNDERLYING_TOKEN:
        process.env["NEXT_PUBLIC_FORKED_UNDERLYING_TOKEN_ADDRESS_WC"]!,
      RPC_URL: process.env["NEXT_PUBLIC_RPC_WC"]!,
    },
  },
};

function getGlobalEnvVars(): GlobalEnvSchema {
  const GLOBAL_ENV = Object.fromEntries(
    Object.entries(GLOBAL_ENV_KEYS).map(([key, value]) => {
      return [key, value];
    })
  ) as GlobalEnvSchema;

  return GLOBAL_ENV;
}

function getChainEnvVars(
  chainId: SupportedChainId,
  anvilForked: boolean
): ChainEnvSchema {
  const envKeys = CHAIN_ENV_KEYS[chainId];
  const keys =
    chainId === 31337
      ? (
          envKeys as {
            local: Record<keyof ChainEnvSchema, string>;
            forked: Record<keyof ChainEnvSchema, string>;
          }
        )[anvilForked ? "forked" : "local"]
      : envKeys;

  return Object.fromEntries(
    Object.entries(keys).map(([key, value]) => [key, value])
  ) as ChainEnvSchema;
}

export function getEnvVars(
  chainId?: SupportedChainId
): GlobalEnvSchema & Partial<ChainEnvSchema> {
  const globalEnv = getGlobalEnvVars();
  const chainEnv = chainId
    ? getChainEnvVars(chainId, globalEnv.ANVIL_FORKED)
    : {};

  return {
    ...globalEnv,
    ...chainEnv,
  };
}
