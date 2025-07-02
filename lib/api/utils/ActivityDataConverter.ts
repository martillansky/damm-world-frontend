import { formatTimestamp } from "@/lib/data/utils/utils";
import { ActivityDataApiResponse, Transaction } from "../types/VaultData.types";

export const convertActivityData = (
  activityData: Array<ActivityDataApiResponse>,
  underlyingTokenDecimals: number
): Transaction[] => {
  return activityData
    .map((tx) => {
      if (tx.return_type && tx.return_type === "deposit") return;
      const rawAmountWei = tx.assets ? tx.assets : tx.shares;
      const decimals = tx.assets ? underlyingTokenDecimals : 18;
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

      const status = tx.status
        ? tx.status === "pending"
          ? "waiting_settlement"
          : tx.status === "canceled"
          ? "failed"
          : tx.status
        : "completed";
      const timestamp = formatTimestamp(
        new Date(tx.timestamp).getTime() / 1000
      );
      const txHash = tx.tx_hash.slice(0, 6) + "..." + tx.tx_hash.slice(-4);
      const id = tx.block.toString();
      const requests_source =
        sourceTable[tx.source_table as keyof typeof sourceTable];
      const type = tx.return_type
        ? tx.return_type === "withdraw"
          ? "redeem"
          : "deposit"
        : requests_source === "redeem"
        ? "withdraw"
        : requests_source;

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
    .filter((tx): tx is Transaction => tx !== undefined)
    .sort((a, b) => Number(b.id) - Number(a.id));
};
