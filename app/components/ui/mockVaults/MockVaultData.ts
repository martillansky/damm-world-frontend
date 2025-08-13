export interface TokenCardProps {
  name: string;
  icon: string;
  active: boolean;
  entranceFee: string;
  exitFee: string;
  performanceFee: string;
  managementFee: string;
}
export const funds: TokenCardProps[] = [
  {
    name: "WLD/USDC",
    icon: "/usdc.png",
    active: true,
    entranceFee: "0.00%",
    exitFee: "0.00%",
    performanceFee: "0.00%",
    managementFee: "0.00%",
  },
  {
    name: "WLD/DAI",
    icon: "/worldcoin.jpeg",
    active: true,
    entranceFee: "0.00%",
    exitFee: "0.00%",
    performanceFee: "0.00%",
    managementFee: "0.00%",
  },
  {
    name: "WLD/USDT",
    icon: "/usdt.png",
    active: true,
    entranceFee: "0.00%",
    exitFee: "0.00%",
    performanceFee: "0.00%",
    managementFee: "0.00%",
  },
  {
    name: "WETH/USDCe",
    icon: "/weth.png",
    active: true,
    entranceFee: "0.00%",
    exitFee: "0.00%",
    performanceFee: "0.00%",
    managementFee: "0.00%",
  },
  {
    name: "WLD/xDAI",
    icon: "/dai.png",
    active: false,
    entranceFee: "0.00%",
    exitFee: "0.00%",
    performanceFee: "0.00%",
    managementFee: "0.00%",
  },
  {
    name: "WLD/USDT0",
    icon: "/worldcoin.jpeg",
    active: false,
    entranceFee: "0.00%",
    exitFee: "0.00%",
    performanceFee: "0.00%",
    managementFee: "0.00%",
  },
];

export interface DataPoint {
  date: string;
  value: number;
}

export interface VaultData {
  vault: string;
  data: DataPoint[];
}

export const getMockPerformanceData = (): VaultData[] => {
  const fundName = funds.map((fund) => fund.name);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const data = fundName.map((fund) => {
    return {
      vault: fund,
      data: months.map((month) => ({
        date: month,
        value: Math.random() * 100,
      })),
    };
  });
  return data;
};

export const mockPerformanceData: VaultData[] = [
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

export const getFilterOptions = (): string[] => {
  const vaultNames = funds.map((fund) => fund.name);
  vaultNames.unshift("all");
  return vaultNames;
};

export const getFilterDisplayLabels = (): Record<string, string> => {
  const vaultNames = getFilterOptions();
  const displayLabels = vaultNames.reduce((acc, fund) => {
    acc[fund] = fund;
    return acc;
  }, {} as Record<string, string>);
  displayLabels["all"] = "All Funds";
  return displayLabels;
};
