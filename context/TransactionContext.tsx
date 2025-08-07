import React, { createContext, ReactNode, useContext, useState } from "react";

interface TransactionState {
  isVisible: boolean;
  title: string;
  message: string;
  status: "pending" | "success" | "error";
}

interface TransactionContextType {
  transactionState: TransactionState;
  showTransaction: (title: string, message: string) => void;
  updateTransactionStatus: (
    status: "pending" | "success" | "error",
    message?: string
  ) => void;
  hideTransaction: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactionState, setTransactionState] = useState<TransactionState>({
    isVisible: false,
    title: "",
    message: "",
    status: "pending",
  });

  const showTransaction = (title: string, message: string) => {
    setTransactionState({
      isVisible: true,
      title,
      message,
      status: "pending",
    });
  };

  const updateTransactionStatus = (
    status: "pending" | "success" | "error",
    message?: string
  ) => {
    setTransactionState((prev) => ({
      ...prev,
      status,
      message: message || prev.message,
    }));
  };

  const hideTransaction = () => {
    setTransactionState((prev) => ({
      ...prev,
      isVisible: false,
    }));
  };

  return (
    <TransactionContext.Provider
      value={{
        transactionState,
        showTransaction,
        updateTransactionStatus,
        hideTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransaction() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error("useTransaction must be used within a TransactionProvider");
  }
  return context;
}
