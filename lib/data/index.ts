import { formatUnits } from "ethers/lib/utils";
import {
  PositionData,
  Transaction,
  VaultData,
  VaultDataResponse,
} from "../api/types/VaultData.types";
//import { useBalanceOf } from "../contracts/hooks/useBalanceOf";
import { useRedeemableAssets } from "../contracts/hooks/useRedeemableAssets";
import { useRetrieveTxs } from "../contracts/hooks/useRetrieveTxs";
import { useSharesReadyToClaim } from "../contracts/hooks/useSharesReadyToClaim";
import { useTVL } from "../contracts/hooks/useTVL";
import { getMockedVaultData } from "./mocks";
import { formatTimestamp } from "./utils/utils";

export function useGetVaultDataDirectly() {
  const { getTVL } = useTVL();
  //const { getBalanceOf } = useBalanceOf();
  const { getSharesReadyToClaim } = useSharesReadyToClaim();
  const { getRedeemableAssets } = useRedeemableAssets();
  const { getRecentTxs } = useRetrieveTxs();
  const wldConversionRate = 1.4;
  let tvlUSD = 0;
  let redeemableAssets = 0;
  let sharesReadyToClaim = 0;
  let position = 0;
  let positionUSD = 0;
  let userBalance = 0;

  const getVaultData = async (): Promise<VaultData> => {
    try {
      const tvl = Number(await getTVL());
      tvlUSD = tvl * wldConversionRate;
      //userBalance = Number(await getBalanceOf());
      userBalance = 0; // TODO: Add user balance
      sharesReadyToClaim = Number(await getSharesReadyToClaim());
      redeemableAssets = Number(await getRedeemableAssets());

      // TODO: Revise if redeemableAssets is part of the position. Lagoon
      // suggests this is so although it seems to be not the case, specially
      // for calculating the rate of the share.
      position = userBalance + sharesReadyToClaim; // + redeemableAssets;
      positionUSD = position * wldConversionRate;
    } catch {
      // Return default values if there's an error (e.g., no address)
      return {
        tvl: 0,
        tvlChange: 0,
        apr: 0,
        aprChange: 0,
        valueGained: 0,
        valueGainedUSD: 0,
        position: 0,
        positionUSD: 0,
        entranceRate: 0,
        exitRate: 0,
        performanceFee: 0,
        managementFee: 0,
      };
    }
    return {
      tvl: tvlUSD,
      tvlChange: 2.21,
      apr: 0,
      aprChange: 0,
      valueGained: 0,
      valueGainedUSD: 0,
      position,
      positionUSD,
      entranceRate: 0,
      exitRate: 0,
      performanceFee: 0,
      managementFee: 0,
    };
  };

  const getPositionData = async (): Promise<PositionData> => {
    try {
      return {
        totalValue: position,
        totalValueUSD: positionUSD,
        wldBalance: userBalance,
        usdcBalance: 0,
        availableToRedeem: redeemableAssets,
        availableToRedeemUSD: redeemableAssets * wldConversionRate,
        vaultShare: tvlUSD > 0 ? (positionUSD * 100) / tvlUSD : 0,
        claimableShares: sharesReadyToClaim,
        sharesInWallet: userBalance,
      };
    } catch {
      return {
        totalValue: 0,
        totalValueUSD: 0,
        wldBalance: 0,
        usdcBalance: 0,
        availableToRedeem: 0,
        availableToRedeemUSD: 0,
        vaultShare: 0,
        claimableShares: 0,
        sharesInWallet: 0,
      };
    }
  };

  const getActivityData = async (): Promise<Transaction[]> => {
    try {
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
          txHash: tx.hash,
          txHashShort: tx.hash.slice(0, 6) + "..." + tx.hash.slice(-4),
          type: functType,
          value: `+$${value.toString()}`,
          timestamp: tx.timestamp ? formatTimestamp(Number(tx.timestamp)) : "",
          rawTs: tx.timestamp ? Number(tx.timestamp) : 0,
          vaultAddress: "0x", //tx.vaultAddress, // TODO: Add vault address
        };
      });
    } catch {
      return [];
    }
  };

  const getVaultDataDirectly = async (): Promise<VaultDataResponse> => {
    try {
      // Uncomment to test with mocked data
      //throw new Error("test");

      const vaultData = await getVaultData();
      const positionData = await getPositionData();
      const activityData = await getActivityData();

      return {
        vaultsData: [
          {
            staticData: {
              vault_id: "1",
              vault_name: "Vault 1",
              vault_symbol: "V1",
              vault_address: "0x123",
              vault_decimals: 18,
              vault_status: "open",
              token_symbol: "T1",
              token_address: "0x123",
              token_decimals: 18,
              fee_receiver_address: "0x123",
            },
            vaultData: vaultData,
            positionData: positionData,
          },
        ],
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
