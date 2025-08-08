import ArrowDownIcon from "@/app/components/icons/ArrowDownIcon";
import ArrowUpIcon from "@/app/components/icons/ArrowUpIcon";
import { useSafeLinkedAccountContext } from "@/context/SafeLinkedAccountContext";
import { useTransaction } from "@/context/TransactionContext";
import { useVault } from "@/context/VaultContext";
import { useView } from "@/context/ViewContext";
import { useBalanceOf } from "@/lib/contracts/hooks/useBalanceOf";
import { useDeposit } from "@/lib/contracts/hooks/useDeposit";
import { useWithdraw } from "@/lib/contracts/hooks/useWithdraw";
import { VaultDataView } from "@/lib/data/types/DataPresenter.types";
import { getTypedChainId } from "@/lib/utils/chain";
import { getEnvVars } from "@/lib/utils/env";
import { useAppKitNetwork } from "@reown/appkit/react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import StackedAreaChart from "./charts/Visx-XYChart/StackedAreaChart";
import ChartIcon from "./icons/ChartIcon";
import OverviewIcon from "./icons/OverviewIcon";
import { BaseActionKey, createActions } from "./ui/common/Action";
import Button from "./ui/common/Button";
import Card, { CardRow } from "./ui/common/Card";
import ChartCard from "./ui/common/ChartCard";
import Dialog, {
  DialogActionButtons,
  DialogContents,
} from "./ui/common/Dialog";
import Input from "./ui/common/Input";
import LoadingComponent from "./ui/common/LoadingComponent";
import ObservationCard from "./ui/common/ObservationCard";
import Select from "./ui/common/Select";
import ViewToggle from "./ui/common/ViewToggle";
import WarningCard from "./ui/common/WarningCard";
import { useActionSlot } from "./ui/layout/ActionSlotProvider";

export default function VaultView() {
  const { safeAddress } = useSafeLinkedAccountContext();
  const { address } = useParams();
  const network = useAppKitNetwork();
  const { vault, isLoading } = useVault();
  const queryClient = useQueryClient();
  const { isChangingView, setViewLoaded } = useView();
  const vaultData: VaultDataView | undefined = useMemo(
    () => vault?.vaultData,
    [vault?.vaultData]
  );
  const { showTransaction, updateTransactionStatus, hideTransaction } =
    useTransaction();
  const { submitRequestDeposit } = useDeposit();
  const { submitRequestWithdraw } = useWithdraw();
  const { setActions } = useActionSlot();
  const [showDialog, setShowDialog] = useState(false);
  const [filter, setFilter] = useState("all");
  const [activeView, setActiveView] = useState("overview");

  const viewOptions = [
    {
      id: "overview",
      label: "Overview",
      icon: <OverviewIcon />,
    },
    {
      id: "chart",
      label: "Performance",
      icon: <ChartIcon />,
    },
  ];

  type VaultActionKey = BaseActionKey & ("DEPOSIT" | "WITHDRAW");
  const [operation, setOperation] = useState<VaultActionKey | null>(null);

  const [amount, setAmount] = useState("");

  const {
    UNDERLYING_TOKEN_SYMB: underlyingTokenSymb,
    SHARE_TOKEN_SYMB: shareTokenSymb,
  } = getEnvVars(getTypedChainId(Number(network.chainId)));

  const { getSuppplyBalanceFromSafe, getBalanceFromSafe } = useBalanceOf();
  const [walletBalance, setWalletBalance] = useState<string>("");

  const [sharesReadyToWithdraw, setSharesReadyToWithdraw] =
    useState<string>("");

  useEffect(() => {
    if (!isLoading && vaultData) {
      setViewLoaded();
    }
  }, [isLoading, vaultData, setViewLoaded]);

  const handleOperation = (op: VaultActionKey) => {
    setOperation(op);
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    setShowDialog(false);
    if (operation === "DEPOSIT") {
      try {
        // Show the overlay
        showTransaction(
          "Processing Deposit",
          "Please wait while we process your deposit request..."
        );

        // Execute transaction
        const tx = await submitRequestDeposit(amount);

        // Update status to pending
        updateTransactionStatus(
          "pending",
          "Transaction submitted! Waiting for confirmation..."
        );

        // Wait for confirmation
        await tx.wait();

        // Update to success
        updateTransactionStatus("success", "Deposit completed successfully!");

        // Hide after 2 seconds
        setTimeout(hideTransaction, 2000);
      } catch (error) {
        console.error("Error in deposit process:", error);
        // Update to error
        updateTransactionStatus(
          "error",
          "Transaction failed. Please try again."
        );

        // Hide after 3 seconds
        setTimeout(hideTransaction, 3000);
      }
    } else {
      try {
        // Show the overlay
        showTransaction(
          "Processing Withdraw Request",
          "Please wait while we process your withdraw request..."
        );

        // Execute transaction
        const tx = await submitRequestWithdraw(amount);

        // Update status to pending
        updateTransactionStatus(
          "pending",
          "Transaction submitted! Waiting for confirmation..."
        );

        // Wait for confirmation
        await tx.wait();

        // Update to success
        updateTransactionStatus(
          "success",
          "Withdraw request completed successfully!"
        );

        // Hide after 2 seconds
        setTimeout(hideTransaction, 2000);
      } catch (error) {
        console.error("Error in withdraw request process:", error);
        // Update to error
        updateTransactionStatus(
          "error",
          "Transaction failed. Please try again."
        );

        // Hide after 3 seconds
        setTimeout(hideTransaction, 3000);
      }
    }
    setAmount("");
    setOperation(null);
    // Invalidate and refetch vault data
    queryClient.invalidateQueries({ queryKey: ["vaultData", safeAddress] });
  };

  const handleMaxClick = () => {
    setAmount(operation === "DEPOSIT" ? walletBalance : sharesReadyToWithdraw);
  };

  useEffect(() => {
    const fetchUnderlyingBalance = async () => {
      try {
        const balance = await getSuppplyBalanceFromSafe();
        setWalletBalance(balance);
      } catch (err) {
        console.warn("Failed to fetch balance:", err);
        setWalletBalance("");
      }
    };

    if (address && !isLoading && address !== "") {
      fetchUnderlyingBalance();
    } else {
      setWalletBalance("");
    }
  }, [getSuppplyBalanceFromSafe, address, isLoading]);

  useEffect(() => {
    const fetchSharesReadyToWithdraw = async () => {
      try {
        const balance = await getBalanceFromSafe();
        setSharesReadyToWithdraw(balance);
      } catch (err) {
        console.warn("Failed to fetch balance:", err);
        setSharesReadyToWithdraw("");
      }
    };

    if (address && address !== "") {
      fetchSharesReadyToWithdraw();
    } else {
      setSharesReadyToWithdraw("");
    }
  }, [getBalanceFromSafe, address]);

  useEffect(() => {
    const actions = createActions(["DEPOSIT", "WITHDRAW"], {
      DEPOSIT: {
        label: "Invest",
        icon: <ArrowUpIcon />,
        onClick: () => handleOperation("DEPOSIT"),
      },
      WITHDRAW: {
        label: "Init Withdraw",
        icon: <ArrowDownIcon />,
        onClick: () => handleOperation("WITHDRAW"),
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
    return <LoadingComponent text="Loading fund data..." />;
  }

  return (
    vaultData && (
      <>
        <div className="space-y-4">
          {/* Overview View */}
          {activeView === "overview" && (
            <Card
              title="Fund Overview"
              subtitle="Performance metrics for this investment fund"
              variant="small"
            >
              <CardRow
                left="TVL"
                right={vaultData.tvl}
                secondaryRight={vaultData.tvlChange}
              />
              <CardRow
                left="APY (12h avg)"
                tooltip="Average annual percentage rate based on the last 12 hours of performance."
                highlightedRight
                right={vaultData.apr}
                secondaryRight={vaultData.aprChange}
              />
              <CardRow
                left="Your Position"
                right={vaultData.position}
                secondaryRight={vaultData.positionUSD}
              />
            </Card>
          )}

          {/* Chart View */}
          {activeView === "chart" && (
            <ChartCard
              title="Fund Performance"
              subtitle="Historical performance metrics and trends"
              variant="small"
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
              <StackedAreaChart vaultName={filter} />
            </ChartCard>
          )}
        </div>

        {/* Fixed View Toggle */}
        <div className="fixed bottom-36 left-1/2 transform -translate-x-1/2">
          <ViewToggle
            views={viewOptions}
            activeView={activeView}
            onViewChange={setActiveView}
            className="scale-75"
          />
        </div>

        {/* Dialog */}
        <Dialog
          open={showDialog}
          onClose={() => setShowDialog(false)}
          title={
            operation === "DEPOSIT"
              ? `Invest ${underlyingTokenSymb}`
              : `Init ${underlyingTokenSymb} Withdraw`
          }
        >
          <DialogContents>
            <Input
              type="number"
              label={`Amount (${underlyingTokenSymb})`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              handleMaxClick={handleMaxClick}
              labelMax={
                <>
                  Max:{" "}
                  {operation === "DEPOSIT"
                    ? walletBalance + " " + underlyingTokenSymb
                    : sharesReadyToWithdraw + " " + underlyingTokenSymb}
                </>
              }
              placeholder="0.0"
            />

            {operation === "DEPOSIT" && (
              <ObservationCard title="Investing Process">
                Investing in a DAMM fund implies:
                <br />
                1. Depositing your {underlyingTokenSymb} into the fund.
                <br />
                2. You&apos;ll receive {shareTokenSymb} shares in your account.
              </ObservationCard>
            )}

            {operation === "WITHDRAW" && (
              <>
                <ObservationCard title="Withdrawal Process">
                  Due to security reasons, our managers will:
                  <br />
                  1. Verify and approve this request for authenticity.
                  <br />
                  2. Swap your {shareTokenSymb} shares into{" "}
                  {underlyingTokenSymb} in this investment fund.
                </ObservationCard>

                <WarningCard title="Withdrawal Disclaimer">
                  Once the withdraw is initiated, your assets will stop
                  generating yield. For receiving your assets back in your
                  account, you can complete the withdraw anytime after approval.
                </WarningCard>
              </>
            )}
          </DialogContents>

          <DialogActionButtons>
            <Button variant="secondary" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {operation === "DEPOSIT" ? "Invest" : "Init Withdraw"}
            </Button>
          </DialogActionButtons>
        </Dialog>
      </>
    )
  );
}
