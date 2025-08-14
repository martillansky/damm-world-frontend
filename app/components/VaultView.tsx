import ArrowDownIcon from "@/app/components/icons/ArrowDownIcon";
import ArrowUpIcon from "@/app/components/icons/ArrowUpIcon";
import { useSafeLinkedAccountContext } from "@/context/SafeLinkedAccountContext";
import { useTransaction } from "@/context/TransactionContext";
import { useVault } from "@/context/VaultContext";
import { useView } from "@/context/ViewContext";
import { useBalanceOf } from "@/lib/contracts/hooks/useBalanceOf";
import { useDeposit } from "@/lib/contracts/hooks/useDeposit";
import { useWithdraw } from "@/lib/contracts/hooks/useWithdraw";
import {
  PositionDataView,
  VaultDataView,
} from "@/lib/data/types/DataPresenter.types";
import { getTypedChainId } from "@/lib/utils/chain";
import { getEnvVars } from "@/lib/utils/env";
import { useAppKitNetwork } from "@reown/appkit/react";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import StackedAreaChart from "./charts/Visx-XYChart/StackedAreaChart";
import ChartIcon from "./icons/ChartIcon";
import RedeemIcon from "./icons/RedeemIcon";
import { BaseActionKey } from "./ui/common/Action";
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
import TokenCard from "./ui/common/TokenCard";
import WarningCard from "./ui/common/WarningCard";
import {
  funds,
  getFilterDisplayLabels,
  getFilterOptions,
  getMockPerformanceData,
  TokenCardProps,
} from "./ui/mockVaults/MockVaultData";

export default function VaultView() {
  const { safeAddress, isDeployed } = useSafeLinkedAccountContext();
  const { address } = useParams();
  const network = useAppKitNetwork();
  const { vault, isLoading } = useVault();
  const queryClient = useQueryClient();
  const { isChangingView, setViewLoaded } = useView();
  const vaultData: VaultDataView | undefined = useMemo(
    () => vault?.vaultData,
    [vault?.vaultData]
  );
  const positionData: PositionDataView | undefined = useMemo(
    () => vault?.positionData,
    [vault?.positionData]
  );
  const { submitRedeem } = useWithdraw();

  const { showTransaction, updateTransactionStatus, hideTransaction } =
    useTransaction();
  const { submitRequestDeposit } = useDeposit();
  const { submitRequestWithdraw } = useWithdraw();

  const [showDialogFundSelected, setShowDialogFundSelected] = useState(false);
  const [filter, setFilter] = useState("all");
  const [showDialogCharts, setShowDialogCharts] = useState(false);

  type VaultActionKey = BaseActionKey & ("DEPOSIT" | "WITHDRAW" | "REDEEM");
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
    if (op === "REDEEM") {
      handleSubmitRedeem();
    }
  };

  const handleSubmitRedeem = async () => {
    try {
      // Show the overlay
      showTransaction(
        "Processing Withdraw completion",
        "Please wait while we process your withdraw completion..."
      );

      const amount = String(positionData!.availableToRedeemRaw);
      // Execute transaction
      const tx = await submitRedeem(amount);

      // Update status to pending
      updateTransactionStatus(
        "pending",
        "Transaction submitted! Waiting for confirmation..."
      );

      // Wait for confirmation
      await tx.wait();

      // Update to success
      updateTransactionStatus("success", "Withdraw completion confirmed!");

      // Hide after 2 seconds
      setTimeout(hideTransaction, 2000);
    } catch (error) {
      console.error("Error in withdraw completion process:", error);
      // Update to error
      updateTransactionStatus("error", "Transaction failed. Please try again.");

      // Hide after 3 seconds
      setTimeout(hideTransaction, 3000);
    }

    setAmount("");
    setOperation(null);
    // Invalidate and refetch vault data
    queryClient.invalidateQueries({ queryKey: ["vaultData", safeAddress] });
  };

  const handleSubmit = async () => {
    setShowDialogFundSelected(false);
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
    } else if (operation === "WITHDRAW") {
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

  const [selectedVault, setSelectedVault] = useState<TokenCardProps | null>(
    null
  );

  const renderTokenCard = (fund: TokenCardProps) => {
    if (!vaultData) return null;
    return (
      <TokenCard
        key={fund.key}
        title={`${fund.name}`}
        subtitle={`${vaultData.aprRaw}% APY (12h avg)`}
        secondSubtitle={`${vaultData.positionRaw} ${underlyingTokenSymb}`}
        onClick={() => {
          setSelectedVault(fund);
          setShowDialogFundSelected(true);
        }}
        icon={
          <Image
            src={fund.icon}
            alt={fund.name}
            className="w-12 h-12 object-cover rounded-full"
            width={32}
            height={32}
          />
        }
        active={fund.active}
      />
    );
  };

  const getOperationsContents = () => {
    return (
      <>
        {(operation === "DEPOSIT" || operation === "WITHDRAW") && (
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
        )}

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
              2. Swap your {shareTokenSymb} shares into {underlyingTokenSymb} in
              this investment fund.
            </ObservationCard>

            <WarningCard title="Withdrawal Disclaimer">
              Once the withdraw is initiated, your assets will stop generating
              yield. For receiving your assets back in your account, you can
              complete the withdraw anytime after approval.
            </WarningCard>
          </>
        )}
      </>
    );
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

  if (isLoading || isChangingView || !vaultData) {
    return <LoadingComponent text="Loading fund data..." />;
  }

  return (
    vaultData && (
      <>
        <div className="space-y-4">
          {/* Funds View */}
          <div className="ml-2">
            <div className="flex justify-end mb-3 mr-2">
              <Button
                onClick={() => setShowDialogCharts(true)}
                variant="secondary"
              >
                <ChartIcon />
                <span>Performance</span>
              </Button>
            </div>

            <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
              {funds.map((fund) => renderTokenCard(fund))}
            </div>
          </div>

          {/* Chart View */}
          <Dialog
            open={showDialogCharts}
            onClose={() => {
              setShowDialogCharts(false);
            }}
            title="Fund Performances"
          >
            <DialogContents>
              <ChartCard
                variant="small"
                light
                selector={
                  <Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    options={getFilterOptions()}
                    displayLabels={getFilterDisplayLabels()}
                    size="small"
                  />
                }
              >
                <StackedAreaChart
                  vaultName={filter}
                  data={getMockPerformanceData()}
                />
              </ChartCard>
            </DialogContents>
            <DialogActionButtons>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDialogCharts(false);
                }}
              >
                Close
              </Button>
            </DialogActionButtons>
          </Dialog>
        </div>

        {/* Dialog Fund Selected */}
        {selectedVault && (
          <Dialog
            open={showDialogFundSelected}
            onClose={() => {
              setShowDialogFundSelected(false);
              setAmount("");
              setOperation(null);
              setSelectedVault(null);
            }}
            title={`${selectedVault.name}`}
            icon={
              <Image
                src={selectedVault.icon}
                alt={selectedVault.name}
                className="w-12 h-12 object-cover rounded-full"
                width={32}
                height={32}
              />
            }
            statusIcon={
              !selectedVault.active && (
                <div className="text-right ml-4">
                  <h3 className="bg-white dark:bg-red-400/10 text-red-400 px-2 py-0.5 rounded-md text-xs font-medium border border-red-400/20 drop-shadow-[0_0_1px_rgba(239,68,68,0.3)]">
                    Closed
                  </h3>
                </div>
              )
            }
          >
            <DialogContents>
              <>
                <Card variant="small" light>
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
                    left="My Deposit"
                    right={`${vaultData.positionRaw} ${underlyingTokenSymb}`}
                    secondaryRight={`${vaultData.positionUSD} USD`}
                  />
                </Card>

                {operation && getOperationsContents()}
                {!operation && (
                  <ObservationCard title="Investment Conditions">
                    <>
                      <CardRow
                        left={`You can invest in this fund by depositing ${underlyingTokenSymb}`}
                        variant="small"
                        style="observation"
                      />
                      <CardRow
                        left="Entrance fee"
                        right={selectedVault.entranceFee}
                        variant="small"
                        style="bullet"
                      />
                      <CardRow
                        left="Exit fee"
                        right={selectedVault.exitFee}
                        variant="small"
                        style="bullet"
                      />
                      <CardRow
                        left="Performance fee"
                        right={selectedVault.performanceFee}
                        variant="small"
                        style="bullet"
                      />
                      <CardRow
                        left="Management fee"
                        right={selectedVault.managementFee}
                        variant="small"
                        style="bullet"
                      />
                    </>
                  </ObservationCard>
                )}
              </>
            </DialogContents>

            <DialogActionButtons>
              {operation ? (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setOperation(null);
                      setAmount("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>
                    {operation === "DEPOSIT"
                      ? "Invest"
                      : operation === "WITHDRAW"
                      ? "Init Withdraw"
                      : "Confirm"}
                  </Button>
                </>
              ) : (
                <>
                  {selectedVault.active && (
                    <Button
                      onClick={() => handleOperation("DEPOSIT")}
                      disabled={!isDeployed}
                    >
                      <ArrowUpIcon />
                      <span>Invest</span>
                    </Button>
                  )}
                  {(positionData?.availableToRedeemRaw &&
                    positionData.availableToRedeemRaw > 0) ||
                  !selectedVault.active ? (
                    <Button
                      onClick={() => handleOperation("REDEEM")}
                      disabled={!isDeployed}
                    >
                      <RedeemIcon />
                      <span /* className="text-xs" */>
                        {/* Claim  */}
                        {positionData?.availableToRedeemRaw}{" "}
                        {underlyingTokenSymb}
                      </span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleOperation("WITHDRAW")}
                      disabled={!isDeployed}
                    >
                      <ArrowDownIcon />
                      <span>Init Withdraw</span>
                    </Button>
                  )}
                </>
              )}
            </DialogActionButtons>
          </Dialog>
        )}
      </>
    )
  );
}
