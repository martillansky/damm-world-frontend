export interface ActivityDataApiResponse {
  vault_id: number;
  block: number;
  log_index: number;
  tx_hash: string;
  sender: string;
  receiver: string;
  owner: string;
  assets: number;
  shares: number;
  timestamp: string;
  chain_id: number;
  vault_name: string;
  vault_address: string;
  vault_symbol: string;
  deposit_symbol: string;
  source_table: string;
  status: string;
  return_type: string;
}
export interface Transaction {
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

export interface IntegratedDataResponse {
  vaultData: VaultData;
  positionData: PositionData;
}
