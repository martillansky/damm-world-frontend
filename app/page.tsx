"use client";

import { useAppKitAccount } from "@reown/appkit/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PresentationView from "./components/PresentationView";
import LoadingComponent from "./components/ui/common/LoadingComponent";

export default function DammWorldMiniApp() {
  const { isConnected } = useAppKitAccount();
  const router = useRouter();
  useEffect(() => {
    if (isConnected) {
      router.push("/wallet");
    }
  }, [isConnected, router]);

  // If wallet is connected, show a loading state while redirecting
  if (isConnected) {
    return <LoadingComponent text="Redirecting to your vault..." />;
  }

  // Otherwise, show the landing page
  return <PresentationView />;
}
