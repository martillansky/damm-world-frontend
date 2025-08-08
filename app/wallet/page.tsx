"use client";

import { useAppKitAccount } from "@reown/appkit/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import LoadingComponent from "../components/ui/common/LoadingComponent";

export default function WalletPage() {
  const { isConnected, address } = useAppKitAccount();
  const router = useRouter();

  // Redirect to vaults page
  useEffect(() => {
    if (!router || address === undefined) return;

    if (!isConnected) {
      router.push("/");
    } else {
      router.push(`/wallet/${address}/smartAccount`);
    }
  }, [isConnected, router, address]);

  // Show loading state while redirecting
  return (
    <LoadingComponent
      text={
        !isConnected
          ? "Redirecting to connect wallet..."
          : "Redirecting to your vault..."
      }
    />
  );
}
