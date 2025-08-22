"use client";

import {
  SafeBalances,
  useSafeBalances,
} from "@/lib/contracts/hooks/useSafeBalances";
import {
  useWalletBalances,
  WalletBalances,
} from "@/lib/contracts/hooks/useWalletBalances";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface BalancesContextType {
  walletBalances: WalletBalances | null;
  safeBalances: SafeBalances | null;
  isLoading: boolean;
}

const BalancesContext = createContext<BalancesContextType | undefined>(
  undefined
);

export function BalancesProvider({ children }: { children: ReactNode }) {
  const walletBalancesQuery = useWalletBalances();
  const safeBalancesQuery = useSafeBalances();

  const { data: walletBalances, isLoading: isLoadingWalletBalances } =
    walletBalancesQuery;
  const { data: safeBalances, isLoading: isLoadingSafeBalances } =
    safeBalancesQuery;

  const [walletBalancesData, setWalletBalancesData] =
    useState<WalletBalances | null>(null);
  const [safeBalancesData, setSafeBalancesData] = useState<SafeBalances | null>(
    null
  );

  // Update state when balances change from React Query
  useEffect(() => {
    if (!isLoadingSafeBalances && safeBalances) {
      setSafeBalancesData(safeBalances);
    }
  }, [safeBalances, isLoadingSafeBalances]);

  useEffect(() => {
    if (!isLoadingWalletBalances && walletBalances) {
      setWalletBalancesData(walletBalances);
    }
  }, [walletBalances, isLoadingWalletBalances]);

  return (
    <BalancesContext.Provider
      value={{
        walletBalances: walletBalancesData,
        safeBalances: safeBalancesData,
        isLoading: isLoadingSafeBalances || isLoadingWalletBalances,
      }}
    >
      {children}
    </BalancesContext.Provider>
  );
}

export function useBalancesContext() {
  const context = useContext(BalancesContext);
  if (context === undefined) {
    throw new Error(
      "useBalancesContext must be used within a BalancesProvider"
    );
  }
  return context;
}
