import { useSnapshots } from "@/lib/api/hooks/Snapshots";
import {
  ChartDataType,
  ChartRangeTypes,
} from "@/lib/api/types/Snapshots.types";
import { useAppKitNetwork } from "@reown/appkit/react";
import { Suspense, useEffect, useState } from "react";
import StackedAreaChart from "./charts/Visx-XYChart/StackedAreaChart";
import ChartCard from "./ui/common/ChartCard";
import LoadingComponent from "./ui/common/LoadingComponent";
import Select from "./ui/common/Select";

export default function MetricsView() {
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
            ? vaultData.total_assets
            : vaultData.apy;
        const vaultId = vaultData.vault_id;

        if (!acc[vaultId]) {
          acc[vaultId] = [];
        }

        acc[vaultId].push({ date, value });
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
    </Suspense>
  );
}
