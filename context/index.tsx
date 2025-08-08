"use client";

import { defaultNetwork, networks, projectId, wagmiAdapter } from "@/lib/reown";
import { createAppKit } from "@reown/appkit/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, type ReactNode } from "react";
import {
  cookieToInitialState,
  useAccount,
  WagmiProvider,
  type Config,
} from "wagmi";
import Providers from "./Providers";
import { SafeLinkedAccountProvider } from "./SafeLinkedAccountContext";
import ServerContent from "./ServerContent";
import { ThemeProvider } from "./ThemeContext";
import { TransactionProvider } from "./TransactionContext";
import { VaultProvider } from "./VaultContext";
import { ViewProvider } from "./ViewContext";

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Set up metadata
const metadata = {
  name: "DAMM World",
  description: "DAMM World",
  url: "https://DAMM-World.com",
  icons: ["/Damm_Capital_Isotipo_Fondo blanco.png"],
};

// Create the modal
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: networks,
  defaultNetwork: defaultNetwork,
  metadata: metadata,
  features: {
    analytics: true,
    connectMethodsOrder: ["wallet"],
  },
  enableNetworkSwitch: true,
});

// Define props interface
interface ContextProviderProps {
  children: ReactNode;
  cookies: string | null;
}

// Add WalletChangeHandler component
function WalletChangeHandler() {
  const { address } = useAccount();
  const router = useRouter();
  const [isInitialMount, setIsInitialMount] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }

    // Clear all queries before navigation
    queryClient.clear();

    // Navigate to home page
    router.push("/");
  }, [address, isInitialMount, router, queryClient]);

  return null;
}

function ContextProvider({ children, cookies }: ContextProviderProps) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies as string
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <Providers>
        <ServerContent />
        <ThemeProvider>
          <ViewProvider>
            <SafeLinkedAccountProvider>
              <VaultProvider>
                <TransactionProvider>
                  <WalletChangeHandler />
                  {children}
                </TransactionProvider>
              </VaultProvider>
            </SafeLinkedAccountProvider>
          </ViewProvider>
        </ThemeProvider>
      </Providers>
    </WagmiProvider>
  );
}

export default ContextProvider;
