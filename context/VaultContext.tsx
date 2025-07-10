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
  const [vault, setVault] = useState<DataPresenter | null>(null);
  const { data, isLoading } = useVaultData(address ?? "");

  useEffect(() => {
    if (isLoading || !address) {
      setVault(null);
    } else if (data && address) {
      setVault(DataWrangler({ data }));
    }
  }, [isLoading, data, address]);

  return (
    <VaultContext.Provider
      value={{
        vault,
        setVault,
        isLoading: address ? isLoading : false,
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
