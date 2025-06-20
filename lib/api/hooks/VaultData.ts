import { useGetVaultDataDirectly } from "@/lib/data";
import { formatTimestamp } from "@/lib/data/utils/utils";
import { getEnvVars } from "@/lib/utils/env";
import { useAppKitNetwork } from "@reown/appkit/react";
import { useQuery } from "@tanstack/react-query";
import { getNullMockedVaultData } from "../../data/mocks/index";
import {
  ActivityDataApiResponse,
  Transaction,
  VaultDataResponse,
} from "../types/VaultData.types";

const convertActivityData = (
  activityData: Array<ActivityDataApiResponse>
): Transaction[] => {
  return activityData
    .map((tx) => {
      if (tx.return_type && tx.return_type === "deposit") return;
      const rawAmountWei = tx.assets ? tx.assets : tx.shares;
      const decimals = tx.assets ? 6 : 18;
      const rawAmount = (Number(rawAmountWei) / 10 ** decimals).toString();
      const amount = rawAmount;
      const value = rawAmount;
      const sourceTable = {
        deposit_requests: "deposit",
        redeem_requests: "redeem",
        vault_returns: "vault_returns",
        //withdraw: "withdraw",
        transfer: "transfer",
      };

      const status = tx.status ? tx.status : "completed";
      const timestamp = formatTimestamp(
        new Date(tx.timestamp).getTime() / 1000
      );
      const txHash = tx.tx_hash.slice(0, 6) + "..." + tx.tx_hash.slice(-4);
      const id = tx.block.toString();
      const type = tx.return_type
        ? tx.return_type
        : sourceTable[tx.source_table as keyof typeof sourceTable];

      return {
        id: id,
        type: type,
        amount: amount,
        status: status,
        timestamp: timestamp,
        txHash: tx.tx_hash,
        txHashShort: txHash,
        value: value,
      };
    })
    .filter((tx): tx is Transaction => tx !== undefined);
};

export function useVaultData(wallet: string) {
  const { getVaultDataDirectly } = useGetVaultDataDirectly();
  const network = useAppKitNetwork();

  return useQuery<VaultDataResponse>({
    queryKey: ["vaultData", wallet],
    queryFn: async () => {
      if (!wallet) return getNullMockedVaultData();
      try {
        //throw new Error("test");
        const res = await fetch(
          `${
            getEnvVars().API_GATEWAY
          }/lagoon/txs/test/${wallet}?offset=0&limit=10&chain_id=${
            network.chainId
          }`
        );
        if (!res.ok) throw new Error("Failed to fetch vault data");

        const activityData: Transaction[] = convertActivityData(
          (await res.json()).txs
        );

        const data: VaultDataResponse = getNullMockedVaultData();
        data.activityData = activityData;

        return data;
      } catch (error) {
        console.warn("Error fetching vault data:", error);
        console.warn("Retrieving vault data from contract");
        return await getVaultDataDirectly();
      }
    },
    enabled: !!wallet,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
