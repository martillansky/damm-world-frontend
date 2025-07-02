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
import {
  convertIntegratedPosition,
  getNullMockedIntegratedPosition,
} from "../utils/IntegratedPositionConverter";

export function useVaultData(wallet: string) {
  const { getUnderlyingTokenDecimals, getBalanceOf } = useBalanceOf();
  const { getVaultDataDirectly } = useGetVaultDataDirectly();
  const network = useAppKitNetwork();

  return useQuery<VaultDataResponse>({
    queryKey: ["vaultData", wallet],
    queryFn: async () => {
      if (typeof wallet !== "string" || wallet.trim() === "") {
        console.warn("No wallet address provided");
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

        let vaultData = await integratedPositionResponse.json();
        if (vaultData.positions.length === 0) {
          console.warn("No positions found");
          vaultData = getNullMockedIntegratedPosition();
        }

        const integratedPositionData: IntegratedDataResponse =
          convertIntegratedPosition(vaultData, Number(await getBalanceOf()));

        const txsResponse = await fetch(
          `${
            getEnvVars().API_GATEWAY
          }/lagoon/txs/test/${wallet}?offset=0&limit=10&chain_id=${
            network.chainId
          }`
        );
        if (!txsResponse.ok) throw new Error("Failed to fetch vault data");

        const underlyingTokenDecimals = await getUnderlyingTokenDecimals();
        const activityData: Transaction[] = convertActivityData(
          (await txsResponse.json()).txs,
          underlyingTokenDecimals
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
