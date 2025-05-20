import {
  PositionData,
  Transaction,
  VaultData,
  VaultDataResponse,
} from "@/lib/api/types/VaultData.types";
import {
  DataPresenter,
  PositionDataView,
  TransactionView,
  VaultDataView,
} from "@/lib/data/types/DataPresenter.types";

export function DataWrangler({
  data,
}: {
  data: VaultDataResponse;
}): DataPresenter {
  return {
    vaultData: transformVaultData(data.vaultData),
    positionData: transformPositionData(data.positionData),
    activityData: transformActivityData(data.activityData),
  };
}

export function transformVaultData(vaultData: VaultData): VaultDataView {
  return {
    tvl: `$${vaultData.tvl}`,
    tvlChange: `(${vaultData.tvlChange > 0 ? "+" : ""}${vaultData.tvlChange}%)`,
    apr: `${vaultData.apr}%`,
    aprChange: `(${Number(vaultData.aprChange) > 0 ? "+" : ""}${
      vaultData.aprChange
    }%)`,
    valueGained: `${vaultData.valueGained} WLD`,
    valueGainedUSD: `≈ $${vaultData.valueGainedUSD}`,
    position: `${vaultData.position} WLD`,
    positionRaw: vaultData.position,
    positionUSD: `≈ $${vaultData.positionUSD}`,
  };
}

export function transformPositionData(
  positionData: PositionData
): PositionDataView {
  return {
    totalValue: `${positionData.totalValue} WLD`,
    totalValueUSD: `≈ $${positionData.totalValueUSD}`,
    wldBalance: `${positionData.wldBalance} WLD`,
    usdcBalance: `${positionData.usdcBalance} USDC`,
    availableToRedeem: `${positionData.availableToRedeem} WLD`,
    availableToRedeemRaw: positionData.availableToRedeem,
    availableToRedeemUSD: `≈ $${positionData.availableToRedeemUSD}`,
    vaultShare: `${positionData.vaultShare}%`,
    claimableShares: `${positionData.claimableShares} vWLD`,
    sharesInWallet: `${positionData.sharesInWallet} vWLD`,
  };
}

export function transformActivityData(
  activityData: Transaction[]
): TransactionView[] {
  return activityData.map((activity) => ({
    id: activity.id,
    type: activity.type,
    amount: activity.amount,
    status: activity.status,
    timestamp: activity.timestamp,
    txHash: activity.txHash,
    value: activity.value,
  }));
}
