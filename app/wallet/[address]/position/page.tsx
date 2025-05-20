"use client";

import PositionView from "@/app/components/PositionView";
import { useParams } from "next/navigation";

export default function WalletView() {
  const { address } = useParams();
  return <PositionView address={address as string} />;
}
