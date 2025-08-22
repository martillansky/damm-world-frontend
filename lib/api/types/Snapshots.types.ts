export interface SnapshotData {
  apy: number;
  chain_id: number;
  delta_hours: number;
  deposit_token_address: string;
  deposit_token_symbol: string;
  deposit_token_decimals: number;
  event_id: string;
  event_timestamp: string;
  management_fee: number;
  performance_fee: number;
  share_price: number;
  total_assets: number;
  total_shares: number;
  vault_id: string;
  vault_name: string;
  vault_token_address: string;
  vault_token_symbol: string;
  vault_token_decimals: number;
}

export type ChartRangeTypes = "24h" | "7d" | "all" | "1y" | "6m" | "1m";

export interface ChartDataType {
  [key: string]: {
    date: string;
    value: number;
    label: string;
    metric: "hours" | "days";
  }[];
}
