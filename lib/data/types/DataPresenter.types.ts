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
}

export interface VaultDataView {
  tvl: string;
  tvlChange: string;
  apr: string;
  aprChange: string;
  valueGained: string;
  valueGainedUSD: string;
  positionRaw: number;
  position: string;
  positionUSD: string;
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

export interface DataPresenter {
  vaultData: VaultDataView;
  positionData: PositionDataView;
  activityData: TransactionView[];
}
