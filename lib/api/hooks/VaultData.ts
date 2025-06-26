import { useGetVaultDataDirectly } from "@/lib/data";

import { useBalanceOf } from "@/lib/contracts/hooks/useBalanceOf";
import { getEnvVars } from "@/lib/utils/env";
import { useAppKitNetwork } from "@reown/appkit/react";
import { useQuery } from "@tanstack/react-query";
import { getNullMockedVaultData } from "../../data/mocks/index";
import {
  IntegratedDataResponse,
  Transaction,
  VaultDataResponse,
} from "../types/VaultData.types";
import { convertActivityData } from "../utils/ActivityDataConverter";
import { convertIntegratedPosition } from "../utils/IntegratedPositionConverter";

export function useVaultData(wallet: string) {
  const { getUnderlyingBalanceOf } = useBalanceOf();
  const { getVaultDataDirectly } = useGetVaultDataDirectly();
  const network = useAppKitNetwork();

  return useQuery<VaultDataResponse>({
    queryKey: ["vaultData", wallet],
    queryFn: async () => {
      if (typeof wallet !== "string" || wallet.trim() === "") {
        return getNullMockedVaultData();
      }
      try {
        //throw new Error("test");
        const integratedPositionResponse = await fetch(
          `${
            getEnvVars().API_GATEWAY
          }/lagoon/integrated/test/${wallet}?offset=0&limit=10&chain_id=${
            network.chainId
          }`
        );
        if (!integratedPositionResponse.ok)
          throw new Error("Failed to fetch vault data");

        const vaultData = await integratedPositionResponse.json();
        if (vaultData.positions.length === 0) {
          return getNullMockedVaultData();
        }

        const integratedPositionData: IntegratedDataResponse =
          convertIntegratedPosition(
            vaultData,
            Number(await getUnderlyingBalanceOf())
          );

        const txsResponse = await fetch(
          `${
            getEnvVars().API_GATEWAY
          }/lagoon/txs/test/${wallet}?offset=0&limit=10&chain_id=${
            network.chainId
          }`
        );
        if (!txsResponse.ok) throw new Error("Failed to fetch vault data");

        const activityData: Transaction[] = convertActivityData(
          (await txsResponse.json()).txs
        );

        const data: VaultDataResponse = {
          vaultData: integratedPositionData.vaultData,
          positionData: integratedPositionData.positionData,
          activityData: activityData,
        };

        return data;
      } catch (error) {
        console.warn("Error fetching vault data:", error);
        console.warn("Retrieving vault data from contract");
        return await getVaultDataDirectly();
      }
    },
    enabled: typeof wallet === "string" && wallet.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
