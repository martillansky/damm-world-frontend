"use client";

import LoadingComponent from "@/app/components/ui/common/LoadingComponent";
import { useAppKitAccount } from "@reown/appkit/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WalletView() {
  const { address } = useParams();
  const router = useRouter();
  const { isConnected } = useAppKitAccount();

  useEffect(() => {
    if (!router || address === undefined) return;

    if (!isConnected) {
      router.push("/");
    } else {
      router.push(`/wallet/${address}/smartAccount`);
    }
  }, [isConnected, router, address]);

  return (
    <LoadingComponent
      text={
        !isConnected
          ? "Redirecting to connect wallet..."
          : "Redirecting to your smart account..."
      }
    />
  );
}
