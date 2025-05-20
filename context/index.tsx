"use client";

import { projectId, wagmiAdapter } from "@/lib/reown";
import { baseSepolia } from "@reown/appkit/networks";
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
import ServerContent from "./ServerContent";
import { ThemeProvider } from "./ThemeContext";
import { useView, ViewProvider } from "./ViewContext";

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Set up metadata
const metadata = {
  name: "DAMM World",
  description: "DAMM World",
  url: "https://DAMM-World.com", // origin must match domain & subdomain
  icons: ["/Damm_Capital_Isotipo_Fondo blanco.png"],
};

// Create the modal
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [baseSepolia],
  defaultNetwork: baseSepolia,
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
  const { setView } = useView();
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
    setView("vault");
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
            <WalletChangeHandler />
            {children}
          </ViewProvider>
        </ThemeProvider>
      </Providers>
    </WagmiProvider>
  );
}

export default ContextProvider;
