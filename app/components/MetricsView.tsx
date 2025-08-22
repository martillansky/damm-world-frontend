import { useSnapshots } from "@/lib/api/hooks/Snapshots";
import {
  ChartDataType,
  ChartRangeTypes,
} from "@/lib/api/types/Snapshots.types";
import { useAppKitNetwork } from "@reown/appkit/react";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { formatUnits } from "viem";
import StackedAreaChart from "./charts/Visx-XYChart/StackedAreaChart";
import ChartIcon from "./icons/ChartIcon";
import VaultIcon from "./icons/VaultIcon";
import Button from "./ui/common/Button";
import { CardRow } from "./ui/common/Card";
import ChartCard from "./ui/common/ChartCard";
import LoadingComponent from "./ui/common/LoadingComponent";
import Select from "./ui/common/Select";
import TokenCard from "./ui/common/TokenCard";

export default function MetricsView({
  presentation,
}: {
  presentation?: boolean;
}) {
  const network = useAppKitNetwork();

  const [filter, setFilter] = useState("all");
  const [range, setRange] = useState<ChartRangeTypes>("1m");
  const [dataFilter, setDataFilter] = useState<string>("total_assets");
  useState<string>("");
  const [chartOptions, setChartOptions] = useState<string[]>([]);
  const [chartDisplayLabels, setChartDisplayLabels] = useState<
    Record<string, string>
  >({});
  const [formattedChartData, setFormattedChartData] = useState<ChartDataType>(
    {}
  );
  const [showDialogCharts, setShowDialogCharts] = useState(true);

  const { data: chartData /* , isLoading: isLoadingChart */ } = useSnapshots({
    chainId: Number(network.chainId),
    ranges: range,
    offset: 0,
    limit: 80,
  });

  const formatChartData = () => {
    if (!chartData) return;

    const reducedChartData: ChartDataType = chartData.reduce(
      (acc, vaultData) => {
        const date = vaultData.event_timestamp;
        const value =
          dataFilter === "total_assets"
            ? Number(
                formatUnits(
                  BigInt(vaultData.total_assets),
                  vaultData.deposit_token_decimals
                )
              )
            : vaultData.apy;
        const vaultId = vaultData.vault_id;

        if (!acc[vaultId]) {
          acc[vaultId] = [];
        }

        acc[vaultId].push({
          date,
          value,
          label: vaultData.deposit_token_symbol,
          metric: range === "24h" ? "hours" : "days",
        });
        return acc;
      },
      {} as ChartDataType
    );

    Object.keys(reducedChartData).forEach((vaultId) => {
      reducedChartData[vaultId].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    });

    const filteredData: ChartDataType =
      filter === "all"
        ? reducedChartData
        : {
            [filter]: reducedChartData[filter],
          };

    setFormattedChartData(filteredData);
  };

  const renderTokenCard = (vaultId: string) => {
    const fund = chartData?.find((vault) => vault.vault_id === vaultId);
    if (!fund) return null;
    const iconSrc = `/${fund.deposit_token_symbol}.png`;
    const iconSrcAlt = `/${fund.deposit_token_symbol}.jpeg`;

    return (
      <TokenCard
        key={fund.vault_id}
        title={`${fund.deposit_token_symbol} Fund`}
        icon={
          <Image
            src={iconSrc}
            alt={iconSrcAlt}
            className="w-12 h-12 object-cover rounded-full"
            width={32}
            height={32}
          />
        }
      >
        <CardRow
          left="TVL"
          right={`${formatUnits(
            BigInt(fund.total_assets),
            fund.deposit_token_decimals
          )} ${fund.deposit_token_symbol}`}
        />

        <CardRow left="APY" right={`${fund.apy}%`} />
      </TokenCard>
    );
  };

  useEffect(() => {
    if (chartData) {
      const chartOptions = chartData.reduce((acc, snapshot) => {
        if (!acc.includes(snapshot.vault_id)) {
          acc.push(snapshot.vault_id);
        }
        return acc;
      }, [] as string[]);
      chartOptions.unshift("all");

      const chartDisplayLabels = chartData.reduce((acc, snapshot) => {
        acc[snapshot.vault_id] = snapshot.deposit_token_symbol;
        return acc;
      }, {} as Record<string, string>);
      chartDisplayLabels["all"] = "All Funds";

      setChartOptions(chartOptions);
      setChartDisplayLabels(chartDisplayLabels);
    }
  }, [chartData]);

  useEffect(() => {
    formatChartData();
  }, [chartData, filter, range, dataFilter]);

  return (
    <Suspense fallback={<LoadingComponent />}>
      {presentation && chartData && (
        <div className="ml-2">
          <div className="flex justify-end mb-3 mr-2">
            <Button
              onClick={() => {
                setShowDialogCharts(!showDialogCharts);
                setFilter("all");
              }}
              variant="secondary"
            >
              {showDialogCharts ? <VaultIcon /> : <ChartIcon />}
              <span>{showDialogCharts ? "Funds" : "Performance"}</span>
            </Button>
          </div>
          {!showDialogCharts && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(formattedChartData).map((vaultId) =>
                renderTokenCard(vaultId)
              )}
            </div>
          )}
        </div>
      )}
      {showDialogCharts && (
        <ChartCard
          variant="small"
          light
          selector={
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={chartOptions}
              displayLabels={chartDisplayLabels}
              size="small"
            />
          }
          onViewChange={(viewId) => setRange(viewId as ChartRangeTypes)}
          externalToggle={{
            externalToggleOptions: [
              {
                id: "total_assets",
                label: "TVL",
              },
              {
                id: "apy",
                label: "APY",
              },
            ],
            externalToggleDisplayLabels: {
              total_assets: "TVL",
              apy: "APY",
            },
            externalToggleValue: dataFilter,
            externalToggleOnChange: (value) => setDataFilter(value),
          }}
        >
          <StackedAreaChart data={formattedChartData} />
        </ChartCard>
      )}
    </Suspense>
  );
}
