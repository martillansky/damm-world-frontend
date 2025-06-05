import { VaultDataResponse } from "@/lib/api/types/VaultData.types";
import { mockedActivity } from "./mockedActivity";
import { mockedPositionData } from "./mockedPosition";
import { mockedVaultData } from "./mockedVault";

export function getNullMockedVaultData(): VaultDataResponse {
  return {
    vaultData: {
      tvl: 0,
      tvlChange: 0,
      apr: 0,
      aprChange: 0,
      valueGained: 0,
      valueGainedUSD: 0,
      position: 0,
      positionUSD: 0,
    },
    positionData: {
      totalValue: 0,
      totalValueUSD: 0,
      wldBalance: 0,
      usdcBalance: 0,
      availableToRedeem: 0,
      availableToRedeemUSD: 0,
      vaultShare: 0,
      claimableShares: 0,
      sharesInWallet: 0,
    },
    activityData: [],
  };
}

export function getMockedVaultData() {
  return {
    vaultData: mockedVaultData,
    positionData: mockedPositionData,
    activityData: mockedActivity,
  };
}
