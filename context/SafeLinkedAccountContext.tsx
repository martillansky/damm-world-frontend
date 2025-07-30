"use client";

import { createContext, ReactNode, useContext } from "react";
import { useSafeLinkedAccount } from "../lib/contracts/hooks/useSafeLinkedAccount";

const SafeLinkedAccountContext = createContext<
  ReturnType<typeof useSafeLinkedAccount> | undefined
>(undefined);

export function SafeLinkedAccountProvider({
  children,
}: {
  children: ReactNode;
}) {
  const safeLinkedAccount = useSafeLinkedAccount();

  return (
    <SafeLinkedAccountContext.Provider value={safeLinkedAccount}>
      {children}
    </SafeLinkedAccountContext.Provider>
  );
}

export function useSafeLinkedAccountContext() {
  const context = useContext(SafeLinkedAccountContext);
  if (context === undefined) {
    throw new Error(
      "useSafeLinkedAccountContext must be used within a SafeLinkedAccountProvider"
    );
  }
  return context;
}
