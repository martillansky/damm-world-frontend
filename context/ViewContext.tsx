"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useTransition } from "react";

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

function parseViewFromPathname(pathname: string): View {
  const segments = pathname.split("/").filter(Boolean);
  const maybeView = segments[segments.length - 1];
  if (
    maybeView === "vault" ||
    maybeView === "position" ||
    maybeView === "activity"
  ) {
    return maybeView;
  }
  return "vault";
}

function getBaseWalletPath(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  const walletIndex = segments.findIndex((seg) => seg === "wallet");

  if (walletIndex !== -1 && segments.length > walletIndex + 1) {
    const address = segments[walletIndex + 1];
    return `/wallet/${address}`;
  }

  return null; // malformed or unknown route
}

export function ViewProvider({ children }: ViewProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const view = parseViewFromPathname(pathname);

  const setView = (newView: View) => {
    const base = getBaseWalletPath(pathname);
    if (!base) {
      console.warn("Could not determine wallet base path from:", pathname);
      return;
    }

    startTransition(() => {
      router.push(`${base}/${newView}`);
    });
  };

  return (
    <ViewContext.Provider
      value={{
        view,
        setView,
        isChangingView: isPending,
        setViewLoaded: () => {},
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
