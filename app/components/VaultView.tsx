import ArrowDownIcon from "@/app/components/icons/ArrowDownIcon";
import ArrowUpIcon from "@/app/components/icons/ArrowUpIcon";
import { useVault } from "@/context/VaultContext";
import { useBalanceOf } from "@/lib/contracts/hooks/useBalanceOf";
import { useDepositRequest } from "@/lib/contracts/hooks/useDepositRequest";
import { VaultDataView } from "@/lib/data/types/DataPresenter.types";
import { useEffect, useState } from "react";
import Button from "./ui/common/Button";
import Card, { CardRow } from "./ui/common/Card";
import Dialog, {
  DialogActionButtons,
  DialogContents,
} from "./ui/common/Dialog";
import Input from "./ui/common/Input";
import LoadingComponent from "./ui/common/LoadingComponent";
import ObservationCard from "./ui/common/ObservationCard";
import Toast, { ToastType } from "./ui/common/Toast";
import WarningCard from "./ui/common/WarningCard";
import { useActionSlot } from "./ui/layout/ActionSlotProvider";

export default function VaultView({}: { address: string }) {
  const { vault } = useVault();
  const vaultData: VaultDataView | undefined = vault?.vaultData;
  const { submitDepositRequest } = useDepositRequest();

  const { setActions } = useActionSlot();
  const [showDialog, setShowDialog] = useState(false);
  const [operation, setOperation] = useState<"deposit" | "withdraw" | null>(
    null
  );
  const [amount, setAmount] = useState("");
  const { getBalanceOf } = useBalanceOf();
  const [walletBalance, setWalletBalance] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("info");

  const handleOperation = (op: "deposit" | "withdraw") => {
    setOperation(op);
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    console.log("Starting submit process...");
    if (operation === "deposit") {
      try {
        console.log("Closing dialog...");
        setShowDialog(false);

        console.log("Submitting deposit request...");
        const tx = await submitDepositRequest(amount);
        //submitDepositRequest(amount);
        console.log("Transaction signed, showing submitted toast...");
        setToastMessage("Deposit request submitted!");
        setToastType("info");
        setShowToast(true);
        console.log("Toast state after submitted:", {
          showToast,
          toastMessage,
          toastType,
        });

        console.log("Waiting for transaction confirmation...");
        await tx.wait();
        console.log("Transaction confirmed, showing confirmation toast...");
        setToastMessage("Deposit request confirmed!");
        setToastType("success");
        setShowToast(true);
        console.log("Toast state after confirmed:", {
          showToast,
          toastMessage,
          toastType,
        });
      } catch (error) {
        console.error("Error in deposit process:", error);
        setToastMessage("Error submitting deposit request");
        setToastType("error");
        setShowToast(true);
        console.log("Toast state after error:", {
          showToast,
          toastMessage,
          toastType,
        });
      }
    } else {
      // TODO: Implement withdraw
    }
    setAmount("");
    setOperation(null);
  };

  const handleMaxClick = () => {
    setAmount(
      operation === "deposit"
        ? walletBalance
        : vaultData!.positionRaw.toString()
    );
  };

  useEffect(() => {
    const fetchWalletBalance = async () => {
      const balance = await getBalanceOf();
      setWalletBalance(balance);
    };
    fetchWalletBalance();
  }, [getBalanceOf]);

  useEffect(() => {
    setActions(
      <>
        <Button onClick={() => handleOperation("deposit")}>
          <ArrowUpIcon />
          <span>Deposit</span>
        </Button>
        <Button onClick={() => handleOperation("withdraw")}>
          <ArrowDownIcon />
          <span>Withdraw</span>
        </Button>
      </>
    );
    return () => setActions(null); // Clean up when component unmounts
  }, [setActions]);

  if (!vaultData) {
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
            left="APR (7 day avg)"
            tooltip="Average annual percentage rate based on the last 7 days of performance."
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
          title={operation === "deposit" ? "Deposit WLD" : "Withdraw WLD"}
        >
          <DialogContents>
            <Input
              type="number"
              label="Amount (WLD)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              handleMaxClick={handleMaxClick}
              labelMax={`Max: ${
                operation === "deposit" ? walletBalance : vaultData.positionRaw
              } WLD`}
              placeholder="0.0"
            />

            {operation === "deposit" && (
              <ObservationCard title="Deposit Process">
                This is a two-step process:
                <br />
                1. Your WLD will be deposited into the vault
                <br />
                2. You&apos;ll receive vWLD shares that can be claimed later
              </ObservationCard>
            )}

            {operation === "withdraw" && (
              <>
                <ObservationCard title="Withdrawal Process">
                  This is a two-step process:
                  <br />
                  1. Your vWLD shares will be burned
                  <br />
                  2. You&apos;ll need to redeem your WLD assets after settlement
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
              {operation === "deposit" ? "Deposit" : "Withdraw"}
            </Button>
          </DialogActionButtons>
        </Dialog>

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
