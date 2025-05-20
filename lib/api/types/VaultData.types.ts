export interface Transaction {
  id: string;
  type: string;
  amount: string;
  status: string;
  timestamp: string;
  txHash: string;
  value: string;
}

export interface VaultData {
  tvl: number;
  tvlChange: number;
  apr: number;
  aprChange: number;
  valueGained: number;
  valueGainedUSD: number;
  position: number;
  positionUSD: number;
}

export interface PositionData {
  totalValue: number;
  totalValueUSD: number;
  wldBalance: number;
  usdcBalance: number;
  availableToRedeem: number;
  availableToRedeemUSD: number;
  vaultShare: number;
  claimableShares: number;
  sharesInWallet: number;
}

export interface VaultDataResponse {
  vaultData: VaultData;
  positionData: PositionData;
  activityData: Transaction[];
}
