export interface DataPoint {
  date: string;
  value: number;
}

export interface VaultData {
  vault: string;
  data: DataPoint[];
}

export const data: VaultData[] = [
  {
    vault: "WLD/USDC",
    data: [
      { date: "Jan", value: 65 },
      { date: "Feb", value: 68 },
      { date: "Mar", value: 70 },
      { date: "Apr", value: 72 },
      { date: "May", value: 75 },
      { date: "Jun", value: 78 },
      { date: "Jul", value: 80 },
      { date: "Aug", value: 82 },
      { date: "Sep", value: 85 },
      { date: "Oct", value: 88 },
      { date: "Nov", value: 90 },
      { date: "Dec", value: 92 },
    ],
  },
  {
    vault: "WLD/DAI",
    data: [
      { date: "Jan", value: 35 },
      { date: "Feb", value: 32 },
      { date: "Mar", value: 30 },
      { date: "Apr", value: 28 },
      { date: "May", value: 25 },
      { date: "Jun", value: 22 },
      { date: "Jul", value: 24 },
      { date: "Aug", value: 36 },
      { date: "Sep", value: 46 },
      { date: "Oct", value: 54 },
      { date: "Nov", value: 67 },
      { date: "Dec", value: 87 },
    ],
  },
  {
    vault: "WLD/USDT",
    data: [
      { date: "Jan", value: 125 },
      { date: "Feb", value: 138 },
      { date: "Mar", value: 140 },
      { date: "Apr", value: 152 },
      { date: "May", value: 165 },
      { date: "Jun", value: 178 },
      { date: "Jul", value: 80 },
      { date: "Aug", value: 92 },
      { date: "Sep", value: 95 },
      { date: "Oct", value: 98 },
      { date: "Nov", value: 120 },
      { date: "Dec", value: 142 },
    ],
  },
];
