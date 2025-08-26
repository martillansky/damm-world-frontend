import ArrowDownIcon from "@/app/components/icons/ArrowDownIcon";
import ArrowUpIcon from "@/app/components/icons/ArrowUpIcon";
import { useBalancesContext } from "@/context/BalancesContext";
import { useSafeLinkedAccountContext } from "@/context/SafeLinkedAccountContext";
import { useTransaction } from "@/context/TransactionContext";
import { useVaults } from "@/context/VaultContext";
import { useView } from "@/context/ViewContext";
import { useDeposit } from "@/lib/contracts/hooks/useDeposit";
import { useWithdraw } from "@/lib/contracts/hooks/useWithdraw";
import { VaultsDataView } from "@/lib/data/types/DataPresenter.types";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ChartIcon from "./icons/ChartIcon";
import RedeemIcon from "./icons/RedeemIcon";
import MetricsView from "./MetricsView";
import { BaseActionKey } from "./ui/common/Action";
import Button from "./ui/common/Button";
import Card, { CardRow } from "./ui/common/Card";
import Dialog, {
  DialogActionButtons,
  DialogContents,
} from "./ui/common/Dialog";
import Input from "./ui/common/Input";
import LoadingComponent from "./ui/common/LoadingComponent";
import ObservationCard from "./ui/common/ObservationCard";
import TokenCard from "./ui/common/TokenCard";
import WarningCard from "./ui/common/WarningCard";

export default function VaultView() {
  const { safeAddress, isDeployed } = useSafeLinkedAccountContext();
  const { address } = useParams();
  const { vaults, isLoading } = useVaults();
  const queryClient = useQueryClient();
  const { isChangingView, setViewLoaded } = useView();
  const vaultsData: VaultsDataView[] | undefined = useMemo(
    () => vaults?.vaultsData,
    [vaults?.vaultsData]
  );

  const { submitRedeem, submitRequestWithdraw } = useWithdraw();

  const { showTransaction, updateTransactionStatus, hideTransaction } =
    useTransaction();
  const { submitRequestDeposit } = useDeposit();

  const [showDialogFundSelected, setShowDialogFundSelected] = useState(false);

  const [showDialogCharts, setShowDialogCharts] = useState(false);

  type VaultActionKey = BaseActionKey & ("DEPOSIT" | "WITHDRAW" | "REDEEM");
  const [operation, setOperation] = useState<VaultActionKey | null>(null);

  const [amount, setAmount] = useState("");

  const [walletBalance, setWalletBalance] = useState<string>("");
  const { safeBalances } = useBalancesContext();

  const [sharesReadyToWithdraw, setSharesReadyToWithdraw] =
    useState<string>("");

  const [maxExceeded, setMaxExceeded] = useState(false);

  useEffect(() => {
    if (!isLoading && vaultsData) {
      setViewLoaded();
    }
  }, [isLoading, vaultsData, setViewLoaded]);

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

      const amount = String(selectedVault!.positionData.availableToRedeemRaw);
      // Execute transaction
      const tx = await submitRedeem(
        selectedVault!.staticData.vault_address,
        selectedVault!.staticData.token_address,
        selectedVault!.staticData.fee_receiver_address,
        selectedVault!.vaultData.exitRate,
        amount
      );

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
        const tx = await submitRequestDeposit(
          selectedVault!.staticData.vault_address,
          selectedVault!.staticData.token_address,
          selectedVault!.staticData.token_decimals,
          selectedVault!.staticData.fee_receiver_address,
          selectedVault!.vaultData.entranceRate,
          amount
        );

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
        const tx = await submitRequestWithdraw(
          selectedVault!.staticData.vault_address,
          amount
        );

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

  const [selectedVault, setSelectedVault] = useState<VaultsDataView | null>(
    vaultsData ? vaultsData[0] : null
  );

  const renderTokenCard = (fund: VaultsDataView) => {
    if (!fund) return null;
    return (
      <TokenCard
        key={fund.staticData.vault_id}
        title={`${fund.staticData.token_symbol}`}
        subtitle={`${fund.vaultData.aprRaw}% APY (12h avg)`}
        secondSubtitle={`${fund.vaultData.positionRaw} ${fund.staticData.token_symbol}`}
        onClick={() => {
          setSelectedVault(fund);
          setShowDialogFundSelected(true);
        }}
        icon={
          <Image
            src={fund.staticData.vault_icon}
            alt={fund.staticData.vault_name}
            className="w-12 h-12 object-cover rounded-full"
            width={32}
            height={32}
          />
        }
        active={fund.staticData.vault_status === "open"}
      />
    );
  };

  const getOperationsContents = () => {
    return (
      <>
        {(operation === "DEPOSIT" || operation === "WITHDRAW") && (
          <Input
            type="number"
            label={"Amount"}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            handleMaxClick={handleMaxClick}
            max={
              operation === "DEPOSIT"
                ? Number(walletBalance)
                : Number(sharesReadyToWithdraw)
            }
            validInput={(valid) => {
              if (valid) {
                setMaxExceeded(false);
              } else {
                setMaxExceeded(true);
              }
            }}
            labelMax={
              <>
                Max:{" "}
                {operation === "DEPOSIT"
                  ? walletBalance + " " + selectedVault?.staticData.token_symbol
                  : sharesReadyToWithdraw +
                    " " +
                    selectedVault?.staticData.token_symbol}
              </>
            }
            placeholder="0.0"
          />
        )}

        {operation === "DEPOSIT" && (
          <ObservationCard title="Investing Process">
            Investing in a DAMM fund implies:
            <br />
            1. Depositing your {selectedVault?.staticData.token_symbol} into the
            fund.
            <br />
            2. You&apos;ll receive {selectedVault?.staticData.vault_symbol}{" "}
            shares in your account.
          </ObservationCard>
        )}

        {operation === "WITHDRAW" && (
          <>
            <ObservationCard title="Withdrawal Process">
              Due to security reasons, our managers will:
              <br />
              1. Verify and approve this request for authenticity.
              <br />
              2. Swap your {selectedVault?.staticData.vault_symbol} shares into{" "}
              {selectedVault?.staticData.token_symbol} in this investment fund.
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
    const fetchUnderlyingBalance = () => {
      try {
        const balance =
          safeBalances!.vaultBalances[selectedVault!.staticData.vault_id]
            .availableSupply;
        setWalletBalance(balance);
      } catch (err) {
        console.warn("Failed to fetch balance:", err);
        setWalletBalance("");
      }
    };

    if (address && !isLoading && selectedVault && safeBalances) {
      fetchUnderlyingBalance();
    } else {
      setWalletBalance("");
    }
  }, [address, selectedVault, isLoading, safeBalances]);

  useEffect(() => {
    const fetchSharesReadyToWithdraw = () => {
      try {
        const balance =
          safeBalances!.vaultBalances[selectedVault!.staticData.vault_id]
            .shares;
        setSharesReadyToWithdraw(balance);
      } catch (err) {
        console.warn("Failed to fetch balance:", err);
        setSharesReadyToWithdraw("");
      }
    };

    if (address && address !== "" && selectedVault && safeBalances) {
      fetchSharesReadyToWithdraw();
    } else {
      setSharesReadyToWithdraw("");
    }
  }, [address, selectedVault, safeBalances]);

  if (isLoading || isChangingView || !vaultsData) {
    return <LoadingComponent text="Loading fund data..." />;
  }

  return (
    vaultsData && (
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
              {vaultsData.map((fund) => renderTokenCard(fund))}
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
              <MetricsView />
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
              setMaxExceeded(false);
            }}
            title={`${selectedVault.staticData.token_symbol}`}
            icon={
              <Image
                src={selectedVault.staticData.vault_icon}
                alt={selectedVault.staticData.vault_name}
                className="w-12 h-12 object-cover rounded-full"
                width={32}
                height={32}
              />
            }
            statusIcon={
              selectedVault.staticData.vault_status !== "open" && (
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
                    right={selectedVault.vaultData.tvl}
                    secondaryRight={selectedVault.vaultData.tvlChange}
                  />
                  <CardRow
                    left="APY (12h avg)"
                    tooltip="Average annual percentage rate based on the last 12 hours of performance."
                    highlightedRight
                    right={selectedVault.vaultData.apr}
                    secondaryRight={selectedVault.vaultData.aprChange}
                  />
                  <CardRow
                    left="My Deposit"
                    right={`${selectedVault.vaultData.positionRaw} ${selectedVault.staticData.token_symbol}`}
                    secondaryRight={`${selectedVault.vaultData.positionUSD} USD`}
                  />
                </Card>

                {operation && getOperationsContents()}
                {!operation && (
                  <ObservationCard title="Investment Conditions">
                    <>
                      <CardRow
                        left={`Dposit ${selectedVault.staticData.token_symbol} to invest`}
                        variant="small"
                        style="observation"
                      />
                      <CardRow
                        left="Entrance rate"
                        right={selectedVault.vaultData.entranceRate}
                        variant="small"
                        style="bullet"
                      />
                      <CardRow
                        left="Exit rate"
                        right={selectedVault.vaultData.exitRate}
                        variant="small"
                        style="bullet"
                      />
                      <CardRow
                        left="Performance fee"
                        right={selectedVault.vaultData.performanceFee}
                        variant="small"
                        style="bullet"
                      />
                      <CardRow
                        left="Management fee"
                        right={selectedVault.vaultData.managementFee}
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
                      setAmount("");
                      setOperation(null);
                      setMaxExceeded(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={maxExceeded}>
                    {operation === "DEPOSIT"
                      ? "Invest"
                      : operation === "WITHDRAW"
                      ? "Init Withdraw"
                      : "Confirm"}
                  </Button>
                </>
              ) : (
                <>
                  {selectedVault.staticData.vault_status === "open" && (
                    <Button
                      onClick={() => handleOperation("DEPOSIT")}
                      disabled={!isDeployed}
                    >
                      <ArrowUpIcon />
                      <span>Invest</span>
                    </Button>
                  )}
                  {(selectedVault.positionData.availableToRedeemRaw &&
                    selectedVault.positionData.availableToRedeemRaw > 0) ||
                  selectedVault.staticData.vault_status !== "open" ? (
                    <Button
                      onClick={() => handleOperation("REDEEM")}
                      disabled={!isDeployed}
                    >
                      <RedeemIcon />
                      <span>
                        {/* Claim  */}
                        {selectedVault.positionData.availableToRedeemRaw}{" "}
                        {selectedVault.staticData.token_symbol}
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
