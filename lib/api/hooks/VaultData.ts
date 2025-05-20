import { useQuery } from "@tanstack/react-query";
import {
  getMockedVaultData,
  getNullMockedVaultData,
} from "../../data/mocks/index";
import { VaultDataResponse } from "../types/VaultData.types";

export function useVaultData(wallet: string) {
  return useQuery<VaultDataResponse>({
    queryKey: ["vaultData", wallet],
    queryFn: async () => {
      if (!wallet) return getNullMockedVaultData();
      try {
        const res = await fetch(`/api/vault/${wallet}`);
        if (!res.ok) throw new Error("Failed to fetch vault data");

        return res.json();
      } catch (error) {
        console.warn("Error fetching vault data:", error);
        console.warn("Returning mocked vault data");
        return getMockedVaultData();
      }
    },
    enabled: !!wallet,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
