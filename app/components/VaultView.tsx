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
import { BaseActionKey, createActions } from "./ui/common/Action";
import Button from "./ui/common/Button";
import Card, { CardRow } from "./ui/common/Card";
import Dialog, {
  DialogActionButtons,
  DialogContents,
} from "./ui/common/Dialog";
import Input from "./ui/common/Input";
import LoadingComponent from "./ui/common/LoadingComponent";
import ObservationCard from "./ui/common/ObservationCard";
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

  type VaultActionKey = BaseActionKey & ("DEPOSIT" | "WITHDRAW");
  const [operation, setOperation] = useState<VaultActionKey | null>(null);

  const [amount, setAmount] = useState("");

  const {
    UNDERLYING_TOKEN_SYMB: underlyingTokenSymb,
    SHARE_TOKEN_SYMB: shareTokenSymb,
  } = getEnvVars(getTypedChainId(Number(network.chainId)));

  const { getBalanceOf, getSuppplyBalanceFromSafe, getBalanceFromSafe } =
    useBalanceOf();
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

    if (address) {
      fetchUnderlyingBalance();
    } else {
      setWalletBalance("");
    }
  }, [getSuppplyBalanceFromSafe, address]);

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

    if (address) {
      fetchSharesReadyToWithdraw();
    } else {
      setSharesReadyToWithdraw("");
    }
  }, [getBalanceOf, address]);

  useEffect(() => {
    const actions = createActions(["DEPOSIT", "WITHDRAW"], {
      DEPOSIT: {
        label: "Deposit",
        icon: <ArrowUpIcon />,
        onClick: () => handleOperation("DEPOSIT"),
      },
      WITHDRAW: {
        label: "Withdraw",
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
    return <LoadingComponent text="Loading vault data..." />;
  }

  return (
    vaultData && (
      <>
        <Card
          title="Vault Overview"
          subtitle="Performance metrics for this liquidity vault"
          variant="large"
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
            left="Value Gained"
            highlightedRight
            right={vaultData.valueGained}
            secondaryRight={vaultData.valueGainedUSD}
          />
          <CardRow
            left="Your Position"
            right={vaultData.position}
            secondaryRight={vaultData.positionUSD}
          />
        </Card>

        {/* Dialog */}
        <Dialog
          open={showDialog}
          onClose={() => setShowDialog(false)}
          title={
            operation === "DEPOSIT"
              ? `Deposit ${underlyingTokenSymb}`
              : `Withdraw ${underlyingTokenSymb}`
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
              <ObservationCard title="Deposit Process">
                This is a two-step process:
                <br />
                1. Your {underlyingTokenSymb} will be deposited into the vault
                <br />
                2. You&apos;ll receive {shareTokenSymb} shares
              </ObservationCard>
            )}

            {operation === "WITHDRAW" && (
              <>
                <ObservationCard title="Withdrawal Process">
                  This is a two-step process:
                  <br />
                  1. Your {shareTokenSymb} shares will be burned
                  <br />
                  2. You&apos;ll need to redeem your {underlyingTokenSymb}{" "}
                  assets after settlement
                </ObservationCard>

                <WarningCard title="Withdrawal Disclaimer">
                  Withdrawn assets will stop generating yield and will no longer
                  be part of the total value. Redeem them anytime after
                  settlement.
                </WarningCard>
              </>
            )}
          </DialogContents>

          <DialogActionButtons>
            <Button variant="secondary" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {operation === "DEPOSIT" ? "Deposit" : "Withdraw"}
            </Button>
          </DialogActionButtons>
        </Dialog>
      </>
    )
  );
}
