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
  return activityData.map((tx) => {
    const rawAmountWei = tx.assets ? tx.assets : tx.shares;
    const rawAmount = (Number(rawAmountWei) / 10 ** 18).toString();
    const amount = rawAmount;
    const value = rawAmount;
    const sourceTable = {
      lagoon_depositrequest: "deposit",
      lagoon_redeemrequest: "redeem",
      lagoon_withdraw: "withdraw",
      lagoon_transfer: "transfer",
    };

    const status = tx.status ? tx.status : "completed";
    const timestamp = formatTimestamp(new Date(tx.timestamp).getTime() / 1000);
    const txHash = tx.tx_hash.slice(0, 6) + "..." + tx.tx_hash.slice(-4);
    const id = tx.block.toString();
    const type = sourceTable[tx.source_table as keyof typeof sourceTable];

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
  });
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
