"use client";

import LoadingComponent from "@/app/components/ui/common/LoadingComponent";
import { useAppKitAccount } from "@reown/appkit/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WalletView() {
  const { address } = useParams();
  const router = useRouter();
  const { isConnected } = useAppKitAccount();

  // Redirect to vaults page
  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    } else {
      router.push(`/wallet/${address}/vault`);
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
