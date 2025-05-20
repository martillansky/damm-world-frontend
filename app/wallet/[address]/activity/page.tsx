"use client";

import ActivityView from "@/app/components/ActivityView";
import { useParams } from "next/navigation";

export default function WalletView() {
  const { address } = useParams();
  return <ActivityView address={address as string} />;
}
