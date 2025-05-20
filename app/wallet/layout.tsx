"use client";

import React from "react";
import AppShell from "../components/ui/layout/AppShell";

export default function WalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
