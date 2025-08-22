import {
  PositionData,
  StaticData,
  Transaction,
  VaultData,
  VaultDataResponse,
} from "@/lib/api/types/VaultData.types";
import {
  DataPresenter,
  PositionDataView,
  StaticDataView,
  TransactionView,
  VaultDataView,
} from "@/lib/data/types/DataPresenter.types";

export function DataWrangler({
  data,
}: {
  data: VaultDataResponse;
}): DataPresenter {
  return {
    vaultsData: data.vaultsData.map((vault) => ({
      staticData: transformStaticData(vault.staticData),
      vaultData: transformVaultData(vault.vaultData),
      positionData: transformPositionData(vault.positionData),
    })),
    activityData: transformActivityData(data.activityData),
  };
}

export function transformStaticData(staticData: StaticData): StaticDataView {
  return {
    vault_id: staticData.vault_id,
    vault_name: staticData.vault_name,
    vault_symbol: staticData.vault_symbol,
    vault_address: staticData.vault_address,
    vault_decimals: staticData.vault_decimals,
    vault_status: staticData.vault_status,
    token_symbol: staticData.token_symbol,
    token_address: staticData.token_address,
    token_decimals: staticData.token_decimals,
    vault_icon: "/" + staticData.token_symbol.split("(")[0] + ".png",
  };
}

export function transformVaultData(vaultData: VaultData): VaultDataView {
  return {
    tvl: `$${vaultData.tvl}`,
    tvlChange: `(${vaultData.tvlChange > 0 ? "+" : ""}${vaultData.tvlChange}%)`,
    apr: `${vaultData.apr}%`,
    aprRaw: vaultData.apr,
    aprChange: `(${Number(vaultData.aprChange) > 0 ? "+" : ""}${
      vaultData.aprChange
    }%)`,
    valueGained: `${vaultData.valueGained} WLD`,
    valueGainedUSD: `≈ $${vaultData.valueGainedUSD}`,
    position: `${vaultData.position} WLD`,
    positionRaw: vaultData.position,
    positionUSD: `≈ $${vaultData.positionUSD}`,
    entranceFee: vaultData.entranceFee,
    exitFee: vaultData.exitFee,
    performanceFee: vaultData.performanceFee,
    managementFee: vaultData.managementFee,
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
    rawTs: activity.rawTs,
    timestamp: activity.timestamp,
    txHash: activity.txHash,
    txHashShort: activity.txHashShort,
    value: activity.value,
    vaultAddress: activity.vaultAddress,
  }));
}
