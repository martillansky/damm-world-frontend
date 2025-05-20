"use client";

import VaultView from "@/app/components/VaultView";
import { useParams } from "next/navigation";

export default function WalletView() {
  const { address } = useParams();
  return <VaultView address={address as string} />;
}
