import { SupportedChainId, supportedChainsObject } from "../reown";

export type ChainEnvKeys = {
  [K in SupportedChainId]: K extends typeof supportedChainsObject.anvil.id
    ? {
        local: Record<keyof ChainEnvSchema, string | boolean>;
        forked: Record<keyof ChainEnvSchema, string | boolean>;
      }
    : Record<keyof ChainEnvSchema, string | boolean>;
};

type GlobalEnvSchema = {
  WALLET_CONNECT_PROJECT_ID: string;
  INFURA_API_KEY: string;
  ANVIL_FORKED: boolean;
  API_GATEWAY: string;
  ENVIRONMENT: string;
  ACTIVE_MINIAPP: boolean;
  LINKED_SAFE_VERSION: string;
};

type ChainEnvSchema = {
  VAULT_ADDRESS: string;
  UNDERLYING_TOKEN: string;
  RPC_URL: string;
  BLOCK_EXPLORER_GATEWAY: string;
  IS_UNDERLYING_WRAP_NATIVE: boolean;
  UNDERLYING_NATIVE_TOKEN_SYMB: string;
  UNDERLYING_TOKEN_SYMB: string;
  SHARE_TOKEN_SYMB: string;
};

const GLOBAL_ENV_KEYS = {
  WALLET_CONNECT_PROJECT_ID:
    process.env["NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"],
  INFURA_API_KEY: process.env["NEXT_PUBLIC_INFURA_API_KEY"],
  ANVIL_FORKED: process.env["NEXT_PUBLIC_ANVIL_FORKED"] === "true",
  API_GATEWAY:
    process.env["NEXT_PUBLIC_ENVIRONMENT"] === "development"
      ? process.env["NEXT_PUBLIC_API_GATEWAY_LOCAL"]
      : process.env["NEXT_PUBLIC_API_GATEWAY_PRODUCTION"],
  ENVIRONMENT: process.env["NEXT_PUBLIC_ENVIRONMENT"],
  ACTIVE_MINIAPP: process.env["NEXT_PUBLIC_ACTIVATE_MINIAPP"] === "true",
  LINKED_SAFE_VERSION:
    process.env["NEXT_PUBLIC_LINKED_SAFE_VERSION"] ?? "v0.1.0",
};

const CHAIN_ENV_KEYS: ChainEnvKeys = {
  [supportedChainsObject.sepolia.id]: {
    VAULT_ADDRESS: process.env["NEXT_PUBLIC_SEPOLIA_VAULT_ADDRESS"]!,
    UNDERLYING_TOKEN: process.env["NEXT_PUBLIC_SEPOLIA_UNDERLYING_TOKEN"]!,
    IS_UNDERLYING_WRAP_NATIVE:
      process.env["NEXT_PUBLIC_SEPOLIA_IS_UNDERLYING_WRAP_NATIVE"]! === "true",
    UNDERLYING_TOKEN_SYMB:
      process.env["NEXT_PUBLIC_SEPOLIA_UNDERLYING_TOKEN_SYMB"] ?? "UNK",
    UNDERLYING_NATIVE_TOKEN_SYMB:
      process.env["NEXT_PUBLIC_SEPOLIA_UNDERLYING_NATIVE_TOKEN_SYMB"] ?? "UNK",
    SHARE_TOKEN_SYMB:
      process.env["NEXT_PUBLIC_SEPOLIA_SHARE_TOKEN_SYMB"] ?? "UNK",
    RPC_URL: process.env["NEXT_PUBLIC_RPC_SEPOLIA"]!,
    BLOCK_EXPLORER_GATEWAY:
      process.env["NEXT_PUBLIC_BLOCK_EXPLORER_GATEWAY_SEPOLIA"]!,
  },
  [supportedChainsObject.baseSepolia.id]: {
    VAULT_ADDRESS: process.env["NEXT_PUBLIC_BASE_SEPOLIA_VAULT_ADDRESS"]!,
    UNDERLYING_TOKEN: process.env["NEXT_PUBLIC_BASE_SEPOLIA_UNDERLYING_TOKEN"]!,
    IS_UNDERLYING_WRAP_NATIVE:
      process.env["NEXT_PUBLIC_BASE_SEPOLIA_IS_UNDERLYING_WRAP_NATIVE"]! ===
      "true",
    UNDERLYING_TOKEN_SYMB:
      process.env["NEXT_PUBLIC_BASE_SEPOLIA_UNDERLYING_TOKEN_SYMB"] ?? "UNK",
    UNDERLYING_NATIVE_TOKEN_SYMB:
      process.env["NEXT_PUBLIC_BASE_SEPOLIA_UNDERLYING_NATIVE_TOKEN_SYMB"] ??
      "UNK",
    SHARE_TOKEN_SYMB:
      process.env["NEXT_PUBLIC_BASE_SEPOLIA_SHARE_TOKEN_SYMB"] ?? "UNK",
    RPC_URL: process.env["NEXT_PUBLIC_RPC_BASE_SEPOLIA"]!,
    BLOCK_EXPLORER_GATEWAY:
      process.env["NEXT_PUBLIC_BLOCK_EXPLORER_GATEWAY_BASE_SEPOLIA"]!,
  },
  [supportedChainsObject.anvil.id]: {
    local: {
      VAULT_ADDRESS: process.env["NEXT_PUBLIC_VAULT_ADDRESS"]!,
      UNDERLYING_TOKEN: process.env["NEXT_PUBLIC_ANVIL_UNDERLYING_TOKEN"]!,
      IS_UNDERLYING_WRAP_NATIVE:
        process.env["NEXT_PUBLIC_ANVIL_IS_UNDERLYING_WRAP_NATIVE"]! === "true",
      UNDERLYING_TOKEN_SYMB:
        process.env["NEXT_PUBLIC_ANVIL_UNDERLYING_TOKEN_SYMB"] ?? "UNK",
      UNDERLYING_NATIVE_TOKEN_SYMB:
        process.env["NEXT_PUBLIC_ANVIL_UNDERLYING_NATIVE_TOKEN_SYMB"] ?? "UNK",
      SHARE_TOKEN_SYMB:
        process.env["NEXT_PUBLIC_ANVIL_SHARE_TOKEN_SYMB"] ?? "UNK",
      RPC_URL: process.env["NEXT_PUBLIC_RPC_ANVIL"]!,
      BLOCK_EXPLORER_GATEWAY:
        process.env["NEXT_PUBLIC_BLOCK_EXPLORER_GATEWAY_ANVIL"]!,
    },
    forked: {
      // WORLDCHAIN FORKED ON ANVIL
      VAULT_ADDRESS: process.env["NEXT_PUBLIC_FORKED_VAULT_ADDRESS_WC"]!,
      UNDERLYING_TOKEN:
        process.env["NEXT_PUBLIC_FORKED_UNDERLYING_TOKEN_ADDRESS_WC"]!,
      IS_UNDERLYING_WRAP_NATIVE:
        process.env["NEXT_PUBLIC_FORKED_IS_UNDERLYING_WRAP_NATIVE_WC"]! ===
        "true",
      UNDERLYING_TOKEN_SYMB:
        process.env["NEXT_PUBLIC_FORKED_UNDERLYING_TOKEN_SYMB_WC"] ?? "UNK",
      UNDERLYING_NATIVE_TOKEN_SYMB:
        process.env["NEXT_PUBLIC_FORKED_UNDERLYING_NATIVE_TOKEN_SYMB_WC"] ??
        "UNK",
      SHARE_TOKEN_SYMB:
        process.env["NEXT_PUBLIC_FORKED_SHARE_TOKEN_SYMB_WC"] ?? "UNK",
      RPC_URL: process.env["NEXT_PUBLIC_RPC_WC"]!,
      BLOCK_EXPLORER_GATEWAY:
        process.env["NEXT_PUBLIC_BLOCK_EXPLORER_GATEWAY_WC"]!,
    },
  },
  [supportedChainsObject.base.id]: {
    VAULT_ADDRESS: process.env["NEXT_PUBLIC_BASE_VAULT_ADDRESS"]!,
    UNDERLYING_TOKEN: process.env["NEXT_PUBLIC_BASE_UNDERLYING_TOKEN"]!,
    IS_UNDERLYING_WRAP_NATIVE:
      process.env["NEXT_PUBLIC_BASE_IS_UNDERLYING_WRAP_NATIVE"]! === "true",
    UNDERLYING_TOKEN_SYMB:
      process.env["NEXT_PUBLIC_BASE_UNDERLYING_TOKEN_SYMB"] ?? "UNK",
    UNDERLYING_NATIVE_TOKEN_SYMB:
      process.env["NEXT_PUBLIC_BASE_UNDERLYING_NATIVE_TOKEN_SYMB"] ?? "UNK",
    SHARE_TOKEN_SYMB: process.env["NEXT_PUBLIC_BASE_SHARE_TOKEN_SYMB"] ?? "UNK",
    RPC_URL: process.env["NEXT_PUBLIC_RPC_BASE"]!,
    BLOCK_EXPLORER_GATEWAY:
      process.env["NEXT_PUBLIC_BLOCK_EXPLORER_GATEWAY_BASE"]!,
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
    chainId === supportedChainsObject.anvil.id
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
): GlobalEnvSchema & ChainEnvSchema {
  const globalEnv = getGlobalEnvVars();
  const chainEnv = chainId
    ? getChainEnvVars(chainId, globalEnv.ANVIL_FORKED)
    : {
        VAULT_ADDRESS: "",
        UNDERLYING_TOKEN: "",
        RPC_URL: "",
        BLOCK_EXPLORER_GATEWAY: "",
        IS_UNDERLYING_WRAP_NATIVE: false,
        UNDERLYING_NATIVE_TOKEN_SYMB: "",
        UNDERLYING_TOKEN_SYMB: "",
        SHARE_TOKEN_SYMB: "",
      };

  return {
    ...globalEnv,
    ...chainEnv,
  };
}
