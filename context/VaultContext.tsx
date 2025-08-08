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
  vault: DataPresenter | null;
  setVault: (vault: DataPresenter | null) => void;
  isLoading: boolean;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

interface VaultProviderProps {
  children: ReactNode;
}

export function VaultProvider({ children }: VaultProviderProps) {
  const { address } = useAppKitAccount();
  const { safeAddress } = useSafeLinkedAccountContext();

  const [vault, setVault] = useState<DataPresenter | null>(null);

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
      setVault(null);
    } else if (data && address) {
      setVault(DataWrangler({ data }));
    }
  }, [isLoading, data, address, hasValidAddresses]);

  return (
    <VaultContext.Provider
      value={{
        vault,
        setVault,
        isLoading: hasValidAddresses ? isLoading : false,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return context;
}
