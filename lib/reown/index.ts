import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  AppKitNetwork,
  base,
  baseSepolia,
  Chain,
} from "@reown/appkit/networks";
import { cookieStorage, createStorage } from "@wagmi/core";
import { anvil } from "./chains";

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("Project ID is not defined");
}

export const defaultNetwork = anvil;
export const supportedChainsObject = {
  anvil,
  baseSepolia,
  base,
};

const supportedChains = Object.values(supportedChainsObject);

export type SupportedChainId =
  (typeof supportedChainsObject)[keyof typeof supportedChainsObject]["id"];

const chains = supportedChains as unknown as readonly [Chain, ...Chain[]];
export const networks = supportedChains as unknown as [
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
