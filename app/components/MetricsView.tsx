import ZoomInIcon from "@/app/components/icons/ZoomInIcon";
import ZoomOutIcon from "@/app/components/icons/ZoomOutIcon";
import { useVaults } from "@/context/VaultContext";
import { useView } from "@/context/ViewContext";
import { VaultDataView } from "@/lib/data/types/DataPresenter.types";
import { useEffect, useMemo, useState } from "react";
import StackedAreaChart from "./charts/Visx-XYChart/StackedAreaChart";
import { BaseActionKey, createActions } from "./ui/common/Action";
import Button from "./ui/common/Button";
import ChartCard from "./ui/common/ChartCard";
import LoadingComponent from "./ui/common/LoadingComponent";
import Select from "./ui/common/Select";
import { useActionSlot } from "./ui/layout/ActionSlotProvider";
import { mockPerformanceData } from "./ui/mockVaults/MockVaultData";

export default function MetricsView() {
  const { vaults, isLoading } = useVaults();
  const { isChangingView, setViewLoaded } = useView();
  const vaultData: VaultDataView | undefined = useMemo(
    () => vaults?.vaultsData[0]?.vaultData,
    [vaults?.vaultsData]
  );

  const { setActions } = useActionSlot();

  type MetricsActionKey = BaseActionKey & ("ZOOM IN" | "ZOOM OUT");

  const [operation, setOperation] = useState<MetricsActionKey | null>(null);

  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!isLoading && vaultData) {
      setViewLoaded();
    }
  }, [isLoading, vaultData, setViewLoaded]);

  const handleOperation = (op: MetricsActionKey) => {
    setOperation(op);

    if (operation === "ZOOM IN") {
    } else {
    }
  };

  useEffect(() => {
    const actions = createActions(["ZOOM IN", "ZOOM OUT"], {
      "ZOOM IN": {
        label: "Zoom In",
        icon: <ZoomInIcon />,
        onClick: () => handleOperation("ZOOM IN"),
      },
      "ZOOM OUT": {
        label: "Zoom Out",
        icon: <ZoomOutIcon />,
        onClick: () => handleOperation("ZOOM OUT"),
      },
    });
    setActions(
      <>
        {actions.map((action) => (
          <Button key={action.label} onClick={action.onClick}>
            {action.icon}
            <span>{action.label}</span>
          </Button>
        ))}
      </>
    );
    return () => setActions(null); // Clean up when component unmounts
  }, [setActions]);

  if (isLoading || isChangingView || !vaultData) {
    return <LoadingComponent text="Loading account data..." />;
  }

  return (
    vaultData && (
      <>
        <ChartCard
          title="Fund Performance"
          subtitle="Historical performance metrics and trends"
          selector={
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={["all", "WLD/USDC", "WLD/DAI", "WLD/USDT"]}
              displayLabels={{
                all: "All Funds",
                "WLD/USDC": "WLD/USDC",
                "WLD/DAI": "WLD/DAI",
                "WLD/USDT": "WLD/USDT",
              }}
              size="small"
            />
          }
        >
          <StackedAreaChart vaultName={filter} data={mockPerformanceData} />
        </ChartCard>
      </>
    )
  );
}
