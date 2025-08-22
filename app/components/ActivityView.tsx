import { useSafeLinkedAccountContext } from "@/context/SafeLinkedAccountContext";
import { useTransaction } from "@/context/TransactionContext";
import { useVaults } from "@/context/VaultContext";
import { useView } from "@/context/ViewContext";
import { Transaction } from "@/lib/api/types/VaultData.types";
import { useDeposit } from "@/lib/contracts/hooks/useDeposit";
import { getTypedChainId } from "@/lib/utils/chain";
import { getEnvVars } from "@/lib/utils/env";
import { useAppKitNetwork } from "@reown/appkit/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import CheckIcon from "./icons/CheckIcon";
import CloseIcon from "./icons/CloseIcon";
import DoubleCheckIcon from "./icons/DoubleCheckIcon";
import WaitingSettlementIcon from "./icons/WaitingSettlementIcon";
import Button from "./ui/common/Button";
import Card from "./ui/common/Card";
import Dialog, {
  DialogActionButtons,
  DialogContents,
} from "./ui/common/Dialog";
import LoadingComponent from "./ui/common/LoadingComponent";
import Select from "./ui/common/Select";
import WarningCard from "./ui/common/WarningCard";

export default function ActivityView() {
  const { safeAddress } = useSafeLinkedAccountContext();
  const { chainId } = useAppKitNetwork();
  const { vaults, isLoading } = useVaults();
  const queryClient = useQueryClient();
  const { cancelDepositRequest } = useDeposit();
  const { isChangingView, setViewLoaded } = useView();
  const [filter, setFilter] = useState("all");
  const transactions = useMemo(
    () => vaults?.activityData ?? [],
    [vaults?.activityData]
  );
  const { showTransaction, updateTransactionStatus, hideTransaction } =
    useTransaction();
  const [showDialog, setShowDialog] = useState(false);
  const [cancelRequested, setCancelRequested] = useState<{
    txId: string;
    status: string;
    vaultAddress: string;
  } | null>(null);

  const safeAddressShort =
    safeAddress?.slice(0, 6) + "..." + safeAddress?.slice(-4);
  const explorerLink = `${
    getEnvVars(getTypedChainId(Number(chainId))).BLOCK_EXPLORER_GATEWAY
  }/address/${safeAddress}`;

  const isCancelRequested = (txId: string) => {
    // Allows to hide the cancel button after the transaction is confirmed, waiting for indexer to update the status
    return (
      cancelRequested?.txId === txId && cancelRequested?.status === "confirmed"
    );
  };

  const handleCancelDeposit = async (vaultAddress: string) => {
    setShowDialog(false);
    try {
      // Show the overlay
      showTransaction(
        "Processing Cancel Deposit",
        "Please wait while we process your cancel deposit request..."
      );

      // Execute transaction
      const tx = await cancelDepositRequest(vaultAddress);
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
        "Deposit request successfully canceled!"
      );
      // Hide after 2 seconds
      setTimeout(hideTransaction, 2000);
      setCancelRequested((prev) =>
        prev ? { ...prev, status: "confirmed" } : null
      );
    } catch (error) {
      console.error("Error in cancel deposit process:", error);
      // Update to error
      updateTransactionStatus("error", "Transaction failed. Please try again.");
      // Hide after 3 seconds
      setTimeout(hideTransaction, 3000);
    }
    // Invalidate and refetch vault data
    queryClient.invalidateQueries({ queryKey: ["vaultData", safeAddress] });
  };

  useEffect(() => {
    if (!isLoading && transactions) {
      setViewLoaded();
    }
  }, [isLoading, transactions, setViewLoaded]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "waiting_settlement":
        return <WaitingSettlementIcon />;
      case "settled":
        return <CheckIcon />;
      case "completed":
        return <DoubleCheckIcon />;
      case "failed":
        return <CloseIcon className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getActionButton = (tx: Transaction) => {
    if (
      tx.type === "deposit" &&
      tx.status === "waiting_settlement" &&
      !isCancelRequested(tx.id)
    ) {
      return (
        <button
          onClick={() => {
            setShowDialog(true);
            setCancelRequested({
              txId: tx.id,
              status: "pending",
              vaultAddress: tx.vaultAddress,
            });
          }}
          className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors border-2 border-red-500/80 hover:border-red-500"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      );
    }
    return null;
  };

  const getTransactionType = (type: string) => {
    switch (type) {
      case "deposit":
        return "Invest";
      case "withdraw":
        return "Init Withdraw";
      case "claim":
        return "Claim";
      case "redeem":
        return "Withdraw";
      case "claim_and_redeem":
        return "Claim & Redeem";
      case "sent":
        return "Sent";
      case "received":
        return "Received";
      default:
        return type;
    }
  };

  const getTxsTable = () => {
    return (
      <div className="space-y-3 max-h-[calc(100vh-415px)] overflow-y-auto pr-2">
        {transactions
          .filter((tx) => {
            if (filter === "all") return true;
            if (filter === "cancellable") {
              return (
                tx.type === "deposit" && tx.status === "waiting_settlement"
              );
            }
            if (filter === "deposit") return tx.type === "deposit";
            if (filter === "withdraw") return tx.type === "withdraw";
            if (filter === "claim") return tx.type === "claim";
            if (filter === "redeem") return tx.type === "redeem";
            if (filter === "claim_and_redeem")
              return tx.type === "claim_and_redeem";
            if (filter === "transfers")
              return tx.type === "sent" || tx.type === "received";
            return true;
          })
          .map((tx, index) => {
            const explorerLink = `${
              getEnvVars(getTypedChainId(chainId as number))
                .BLOCK_EXPLORER_GATEWAY
            }/tx/${tx.txHash}`;

            return (
              <div
                key={index}
                className="flex items-center space-x-3 py-2 border-b border-border-light dark:border-border last:border-0"
              >
                <div className="w-8 flex items-center justify-center">
                  {getActionButton(tx)}
                </div>
                <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-xs">
                      {getTransactionType(tx.type)} #{tx.id}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <p className="text-xs text-muted-light dark:text-muted">
                      {tx.amount}
                    </p>
                  </div>
                  <div className="col-span-2 flex items-center justify-center">
                    <a
                      href={explorerLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-lime-400 hover:underline drop-shadow-[0_0_1px_rgba(163,230,53,0.3)]"
                    >
                      {tx.txHashShort}
                    </a>
                  </div>
                  <div className="flex items-center justify-end space-x-4">
                    <p className="text-xs text-muted-light dark:text-muted">
                      {tx.timestamp}
                    </p>
                    <div className="w-4 h-4 flex items-center justify-center">
                      {getStatusIcon(tx.status)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    );
  };

  if (isLoading || isChangingView || !vaults || !vaults.activityData) {
    return <LoadingComponent text="Loading activity data..." />;
  }

  return (
    transactions && (
      <>
        <Card
          title="DAMM Account"
          variant="small"
          selector={
            <a
              href={explorerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-lime-400 hover:underline drop-shadow-[0_0_1px_rgba(163,230,53,0.3)]"
            >
              {safeAddressShort}
            </a>
          }
        />
        <div className="relative -top-3">
          <Card
            //title="Transaction Activity"
            variant="small"
            selector={
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                options={[
                  "all",
                  "cancellable",
                  "deposit",
                  "withdraw",
                  "claim",
                  "redeem",
                  "claim_and_redeem",
                  "transfers",
                ]}
                displayLabels={{
                  all: "All Activities",
                  cancellable: "Cancellable",
                  deposit: "Deposits",
                  withdraw: "Withdraws",
                  claim: "Claims",
                  redeem: "Redeems",
                  claim_and_redeem: "Claim & Redeem",
                  transfers: "Transfers",
                }}
                size="small"
              />
            }
          >
            {getTxsTable()}
          </Card>
        </div>

        {/* Dialog */}
        <Dialog
          open={showDialog}
          onClose={() => setShowDialog(false)}
          title="Cancel Deposit"
        >
          <DialogContents>
            <WarningCard title="Cancel Deposit Request Disclaimer">
              Cancelling your deposit request will:
              <br />• Cancel the deposit request
              <br />• Restore the underlying asset to your DAMM account
              <br />
              <br />
              This action is irreversible.
            </WarningCard>
          </DialogContents>
          <DialogActionButtons>
            <Button variant="secondary" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                handleCancelDeposit(cancelRequested?.vaultAddress || "")
              }
            >
              Confirm
            </Button>
          </DialogActionButtons>
        </Dialog>
      </>
    )
  );
}
