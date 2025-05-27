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
  let position = 0;
  let positionUSD = 0;

  const getVaultData = async (): Promise<VaultData> => {
    const tvl = await getTVL();
    formattedTVL = Number(tvl) * wldConversionRate;
    const userBalance = Number(await getBalanceOf());
    const sharesReadyToClaim = Number(await getSharesReadyToClaim());
    redeemableAssets = Number(await getRedeemableAssets());
    position = userBalance + sharesReadyToClaim + redeemableAssets;

    positionUSD = position * wldConversionRate; // TODO: check if this is correct
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
    const redeemableAssets = Number(await getRedeemableAssets());
    const claimableShares = Number(await getSharesReadyToClaim());
    return {
      totalValue: position,
      totalValueUSD: positionUSD,
      wldBalance: 0,
      usdcBalance: 0,
      availableToRedeem: redeemableAssets,
      availableToRedeemUSD: redeemableAssets * wldConversionRate,
      vaultShare: (position * 100) / formattedTVL,
      claimableShares,
      sharesInWallet: 0,
    };
  };

  const getActivityData = (): Transaction[] => {
    return [];
  };

  const getVaultDataDirectly = async (): Promise<VaultDataResponse> => {
    try {
      const vaultData = await getVaultData();
      const positionData = await getPositionData();
      const activityData = getActivityData();

      return {
        vaultData,
        positionData,
        activityData,
      };
    } catch (error) {
      console.error(
        "Retrieving mocked data. Error fetching vault data from contract:",
        error
      );
      return getMockedVaultData();
    }
  };

  return { getVaultDataDirectly };
}
