import { formatUnits } from "ethers/lib/utils";
import {
  PositionData,
  Transaction,
  VaultData,
  VaultDataResponse,
} from "../api/types/VaultData.types";
import { useBalanceOf } from "../contracts/hooks/useBalanceOf";
import { useRedeemableAssets } from "../contracts/hooks/useRedeemableAssets";
import { useRetrieveTxs } from "../contracts/hooks/useRetrieveTxs";
import { useSharesReadyToClaim } from "../contracts/hooks/useSharesReadyToClaim";
import { useTVL } from "../contracts/hooks/useTVL";
import { getMockedVaultData } from "./mocks";
import { formatTimestamp } from "./utils/utils";

export function useGetVaultDataDirectly() {
  const { getTVL } = useTVL();
  const { getBalanceOf } = useBalanceOf();
  const { getSharesReadyToClaim } = useSharesReadyToClaim();
  const { getRedeemableAssets } = useRedeemableAssets();
  const { getRecentTxs } = useRetrieveTxs();
  const wldConversionRate = 1.4;
  let formattedTVL = 0;
  let redeemableAssets = 0;
  let sharesReadyToClaim = 0;
  let position = 0;
  let positionUSD = 0;
  let userBalance = 0;

  const getVaultData = async (): Promise<VaultData> => {
    try {
      const tvl = await getTVL();
      formattedTVL = Number(tvl) * wldConversionRate;
      userBalance = Number(await getBalanceOf());
      sharesReadyToClaim = Number(await getSharesReadyToClaim());
      redeemableAssets = Number(await getRedeemableAssets());
      position = userBalance + sharesReadyToClaim + redeemableAssets;
      positionUSD = position * wldConversionRate;
    } catch (error) {
      throw error;
    }
    return {
      tvl: formattedTVL,
      tvlChange: 2.21,
      apr: 0,
      aprChange: 0,
      valueGained: 0,
      valueGainedUSD: 0,
      position,
      positionUSD,
    };
  };

  const getPositionData = async (): Promise<PositionData> => {
    return {
      totalValue: position,
      totalValueUSD: positionUSD,
      wldBalance: userBalance,
      usdcBalance: 0,
      availableToRedeem: redeemableAssets,
      availableToRedeemUSD: redeemableAssets * wldConversionRate,
      vaultShare: formattedTVL > 0 ? (positionUSD * 100) / formattedTVL : 0,
      claimableShares: sharesReadyToClaim,
      sharesInWallet: userBalance,
    };
  };

  const getActivityData = async (): Promise<Transaction[]> => {
    const txs = await getRecentTxs();
    return txs.map((tx, index) => {
      const functType =
        tx.functionName === "deposit"
          ? "deposit"
          : tx.functionName === "redeem"
          ? "redeem"
          : tx.functionName === "requestDeposit"
          ? "deposit"
          : tx.functionName === "requestRedeem"
          ? "withdraw"
          : "unknown";
      const functStatus =
        tx.functionName === "deposit"
          ? "completed"
          : tx.functionName === "redeem"
          ? "completed"
          : tx.functionName === "requestDeposit" &&
            !tx.isSettled &&
            !tx.isCanceled
          ? "waiting_settlement"
          : tx.functionName === "requestDeposit" &&
            tx.isSettled &&
            !tx.isCanceled
          ? "settled"
          : tx.functionName === "requestDeposit" &&
            !tx.isSettled &&
            tx.isCanceled
          ? "failed"
          : tx.functionName === "requestRedeem" && !tx.isSettled
          ? "waiting_settlement"
          : tx.functionName === "requestRedeem" && tx.isSettled
          ? "completed"
          : "unknown";

      const amount = Number(formatUnits(tx.args[0], 18));
      const value = amount * wldConversionRate;
      return {
        id: index.toString(),
        amount: `${amount.toString()} WLD`,
        status: functStatus,
        txHash: tx.hash.slice(0, 6) + "..." + tx.hash.slice(-4),
        type: functType,
        value: `+$${value.toString()}`,
        timestamp: tx.timestamp ? formatTimestamp(Number(tx.timestamp)) : "",
      };
    });
  };

  const getVaultDataDirectly = async (): Promise<VaultDataResponse> => {
    try {
      //throw new Error("test");
      const vaultData = await getVaultData();
      const positionData = await getPositionData();
      const activityData = await getActivityData();

      return {
        vaultData,
        positionData,
        activityData,
      };
    } catch (error) {
      console.warn(
        "Retrieving mocked data. Error fetching vault data from contract:",
        error
      );
      return getMockedVaultData();
    }
  };

  return { getVaultDataDirectly };
}
