export interface TransactionView {
  id: string;
  type: string;
  amount: string;
  status: string;
  rawTs: number;
  timestamp: string;
  txHash: string;
  txHashShort: string;
  value: string;
  vaultAddress: string;
}

export interface VaultDataView {
  tvl: string;
  tvlChange: string;
  apr: string;
  aprRaw: number;
  aprChange: string;
  valueGained: string;
  valueGainedUSD: string;
  positionRaw: number;
  position: string;
  positionUSD: string;
  entranceFee: number;
  exitFee: number;
  performanceFee: number;
  managementFee: number;
}

export interface PositionDataView {
  totalValue: string;
  totalValueUSD: string;
  wldBalance: string;
  usdcBalance: string;
  availableToRedeem: string;
  availableToRedeemRaw: number;
  availableToRedeemUSD: string;
  vaultShare: string;
  claimableShares: string;
  sharesInWallet: string;
}

export interface StaticDataView {
  vault_id: string;
  vault_name: string;
  vault_symbol: string;
  vault_address: string;
  vault_decimals: number;
  vault_status: string;
  token_symbol: string;
  token_address: string;
  token_decimals: number;
  vault_icon: string;
}

export interface VaultsDataView {
  staticData: StaticDataView;
  vaultData: VaultDataView;
  positionData: PositionDataView;
}

export interface DataPresenter {
  vaultsData: VaultsDataView[];
  activityData: TransactionView[];
}
