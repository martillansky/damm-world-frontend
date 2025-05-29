import { useVault } from "@/context/VaultContext";
import { useView } from "@/context/ViewContext";
import { Transaction } from "@/lib/api/types/VaultData.types";
import { useDeposit } from "@/lib/contracts/hooks/useDeposit";
import { useEffect, useMemo, useState } from "react";
import CheckIcon from "./icons/CheckIcon";
import CloseIcon from "./icons/CloseIcon";
import WaitingSettlementIcon from "./icons/WaitingSettlementIcon";
import Card from "./ui/common/Card";
import LoadingComponent from "./ui/common/LoadingComponent";
import Toast, { ToastType } from "./ui/common/Toast";

export default function ActivityView() {
  const { vault, isLoading } = useVault();
  const { cancelDepositRequest } = useDeposit();
  const { isChangingView, setViewLoaded } = useView();
  const [filter, setFilter] = useState("all");
  const transactions = useMemo(
    () => vault?.activityData ?? [],
    [vault?.activityData]
  );
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("info");

  const handleCancelDeposit = async () => {
    const tx = await cancelDepositRequest();
    setToastMessage("Cancel deposit request submitted!");
    setToastType("info");
    setShowToast(true);

    await tx.wait();
    setToastMessage("Deposit request successfully canceled!");
    setToastType("success");
    setShowToast(true);
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
      case "completed":
        return <CheckIcon />;
      case "failed":
        return <CloseIcon className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getActionButton = (tx: Transaction) => {
    if (tx.type === "deposit" && tx.status === "waiting_settlement") {
      return (
        <button
          onClick={() => handleCancelDeposit()}
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
        return "Deposit";
      case "withdraw":
        return "Withdraw";
      case "claim":
        return "Claim";
      case "redeem":
        return "Redeem";
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
      <div className="space-y-3 max-h-[calc(100vh-360px)] overflow-y-auto pr-2">
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
          .map((tx) => (
            <div
              key={tx.id}
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
                    href={`https://etherscan.io/tx/${tx.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-lime-400 hover:underline drop-shadow-[0_0_1px_rgba(163,230,53,0.3)]"
                  >
                    {tx.txHash}
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
          ))}
      </div>
    );
  };

  if (isLoading || isChangingView) {
    return <LoadingComponent text="Loading activity data..." />;
  }

  return (
    transactions && (
      <>
        <Card
          title="Recent Activity"
          variant="small"
          subtitle="Transaction activity for this liquidity vault"
          selector={
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-2 py-1 bg-surface-hover-light dark:bg-zinc-800 rounded-lg text-xs font-medium border border-border-light dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Activities</option>
              <option value="cancellable">Cancellable</option>
              <option value="deposit">Deposits</option>
              <option value="withdraw">Withdraws</option>
              <option value="claim">Claims</option>
              <option value="redeem">Redeems</option>
              <option value="claim_and_redeem">Claim & Redeem</option>
              <option value="transfers">Transfers</option>
            </select>
          }
        >
          {getTxsTable()}
        </Card>

        {/* Toast */}
        <Toast
          show={showToast}
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
          duration={5000}
        />
      </>
    )
  );
}
