import { VaultDataResponse } from "@/lib/api/types/VaultData.types";
import { mockedActivity } from "./mockedActivity";
import { mockedPositionData } from "./mockedPosition";
import { mockedVaultData } from "./mockedVault";

export function getNullMockedVaultData(): VaultDataResponse {
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
        vaultData: {
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
      },
    ],
    activityData: [],
  };
}

export function getMockedVaultData() {
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
        vaultData: mockedVaultData,
        positionData: mockedPositionData,
      },
    ],

    activityData: mockedActivity,
  };
}
