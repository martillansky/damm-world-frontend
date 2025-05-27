"use client";

import { useAppKitAccount } from "@reown/appkit/react";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type View = "vault" | "position" | "activity";

interface ViewContextType {
  view: View;
  setView: (view: View) => void;
  isChangingView: boolean;
  setViewLoaded: () => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

interface ViewProviderProps {
  children: ReactNode;
}

export function ViewProvider({ children }: ViewProviderProps) {
  const { address } = useAppKitAccount();
  const [view, setView] = useState<View>("vault");
  const [isChangingView, setIsChangingView] = useState(false);

  // Set view to vault when wallet changes
  useEffect(() => {
    if (address) {
      setView("vault");
    }
  }, [address]);

  const handleViewChange = (newView: View) => {
    if (newView === view) return;
    setIsChangingView(true);
    setView(newView);
  };

  const setViewLoaded = () => {
    setTimeout(() => {
      setIsChangingView(false);
    }, 300);
    //setIsChangingView(false);
  };

  return (
    <ViewContext.Provider
      value={{
        view,
        setView: handleViewChange,
        isChangingView,
        setViewLoaded,
      }}
    >
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error("useView must be used within a ViewProvider");
  }
  return context;
}
