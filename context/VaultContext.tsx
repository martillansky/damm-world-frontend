"use client";

import { DataPresenter } from "@/lib/data/types/DataPresenter.types";
import { DataWrangler } from "@/lib/data/utils/DataWrangler";
import { useAppKitAccount } from "@reown/appkit/react";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useVaultData } from "../lib/api/hooks/VaultData";
import { useSafeLinkedAccountContext } from "./SafeLinkedAccountContext";

interface VaultContextType {
  vaults: DataPresenter | null;
  setVaults: (vaults: DataPresenter | null) => void;
  isLoading: boolean;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

interface VaultProviderProps {
  children: ReactNode;
}

export function VaultProvider({ children }: VaultProviderProps) {
  const { address } = useAppKitAccount();
  const { safeAddress } = useSafeLinkedAccountContext();

  const [vaults, setVaults] = useState<DataPresenter | null>(null);

  // Check if we have valid addresses
  const hasValidAddresses =
    address &&
    safeAddress &&
    safeAddress.length > 0 &&
    safeAddress.startsWith("0x");

  // Only call useVaultData when we have valid addresses
  const vaultDataQuery = useVaultData(hasValidAddresses ? safeAddress : "");
  const { data, isLoading } = vaultDataQuery;

  useEffect(() => {
    if (!hasValidAddresses || isLoading || !address) {
      setVaults(null);
    } else if (data && address) {
      setVaults(DataWrangler({ data }));
    }
  }, [isLoading, data, address, hasValidAddresses]);

  return (
    <VaultContext.Provider
      value={{
        vaults,
        setVaults,
        isLoading: hasValidAddresses ? isLoading : false,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVaults() {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error("useVaults must be used within a VaultProvider");
  }
  return context;
}
