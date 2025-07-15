import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  AppKitNetwork,
  base,
  baseSepolia,
  Chain,
  sepolia,
} from "@reown/appkit/networks";
import { cookieStorage, createStorage } from "@wagmi/core";
import { anvil } from "./chains";

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("Project ID is not defined");
}

export const defaultNetwork = sepolia;
export const supportedChainsObject = {
  anvil,
  baseSepolia,
  base,
  sepolia,
};

export const supportedChainsActiveObject = {
  sepolia,
  base,
};

const supportedChains = Object.values(supportedChainsObject);
const supportedChainsActive = Object.values(supportedChainsActiveObject);

export type SupportedChainId =
  (typeof supportedChainsObject)[keyof typeof supportedChainsObject]["id"];

const chains = supportedChains as unknown as readonly [Chain, ...Chain[]];
export const networks = supportedChainsActive as unknown as [
  AppKitNetwork,
  ...AppKitNetwork[]
];

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
  chains,
});

export const config = wagmiAdapter.wagmiConfig;
