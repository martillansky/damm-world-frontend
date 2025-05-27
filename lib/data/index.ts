import {
  PositionData,
  Transaction,
  VaultData,
  VaultDataResponse,
} from "../api/types/VaultData.types";
import { useBalanceOf } from "../contracts/hooks/useBalanceOf";
import { useRedeemableAssets } from "../contracts/hooks/useRedeemableAssets";
import { useSharesReadyToClaim } from "../contracts/hooks/useSharesReadyToClaim";
import { useTVL } from "../contracts/hooks/useTVL";
import { getMockedVaultData } from "./mocks";

export function useGetVaultDataDirectly() {
  const { getTVL } = useTVL();
  const { getBalanceOf } = useBalanceOf();
  const { getSharesReadyToClaim } = useSharesReadyToClaim();
  const { getRedeemableAssets } = useRedeemableAssets();
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
      vaultShare: (position * 100) / formattedTVL,
      claimableShares: sharesReadyToClaim,
      sharesInWallet: 0,
    };
  };

  const getActivityData = (): Transaction[] => {
    return [];
  };

  const getVaultDataDirectly = async (): Promise<VaultDataResponse> => {
    try {
      throw new Error("test");
      const vaultData = await getVaultData();
      const positionData = await getPositionData();
      const activityData = getActivityData();

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
