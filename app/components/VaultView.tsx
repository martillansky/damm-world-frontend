import ArrowDownIcon from "@/app/components/icons/ArrowDownIcon";
import ArrowUpIcon from "@/app/components/icons/ArrowUpIcon";
import { useVault } from "@/context/VaultContext";
import { useView } from "@/context/ViewContext";
import { useBalanceOf } from "@/lib/contracts/hooks/useBalanceOf";
import { useDeposit } from "@/lib/contracts/hooks/useDeposit";
import { useWithdraw } from "@/lib/contracts/hooks/useWithdraw";
import { VaultDataView } from "@/lib/data/types/DataPresenter.types";
import { useEffect, useMemo, useState } from "react";
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

export default function VaultView() {
  const { vault, isLoading } = useVault();
  const { isChangingView, setViewLoaded } = useView();
  const vaultData: VaultDataView | undefined = useMemo(
    () => vault?.vaultData,
    [vault?.vaultData]
  );
  const { submitRequestDeposit } = useDeposit();
  const { submitRequestWithdraw } = useWithdraw();

  const { setActions } = useActionSlot();
  const [showDialog, setShowDialog] = useState(false);
  const [operation, setOperation] = useState<"deposit" | "withdraw" | null>(
    null
  );
  const [amount, setAmount] = useState("");
  const { getUnderlyingBalanceOf, getBalanceOf } = useBalanceOf();
  const [walletBalance, setWalletBalance] = useState<string>("");
  const [sharesReadyToWithdraw, setSharesReadyToWithdraw] =
    useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("info");

  useEffect(() => {
    if (!isLoading && vaultData) {
      setViewLoaded();
    }
  }, [isLoading, vaultData, setViewLoaded]);

  const handleOperation = (op: "deposit" | "withdraw") => {
    setOperation(op);
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    setShowDialog(false);
    if (operation === "deposit") {
      try {
        const tx = await submitRequestDeposit(amount);
        setToastMessage("Deposit request submitted!");
        setToastType("info");
        setShowToast(true);

        await tx.wait();
        setToastMessage("Deposit request confirmed!");
        setToastType("success");
        setShowToast(true);
      } catch (error) {
        console.error("Error in deposit process:", error);
        setToastMessage("Error submitting deposit request");
        setToastType("error");
        setShowToast(true);
      }
    } else {
      try {
        const tx = await submitRequestWithdraw(amount);
        setToastMessage("Withdraw request submitted!");
        setToastType("info");
        setShowToast(true);

        await tx.wait();
        setToastMessage("Withdraw request confirmed!");
        setToastType("success");
        setShowToast(true);
      } catch (error) {
        console.error("Error in withdraw process:", error);
        setToastMessage("Error submitting withdraw request");
        setToastType("error");
        setShowToast(true);
      }
    }
    setAmount("");
    setOperation(null);
  };

  const handleMaxClick = () => {
    setAmount(operation === "deposit" ? walletBalance : sharesReadyToWithdraw);
  };

  useEffect(() => {
    const fetchWalletBalance = async () => {
      const balance = await getUnderlyingBalanceOf();
      setWalletBalance(balance);
    };
    fetchWalletBalance();
  }, [getUnderlyingBalanceOf]);

  useEffect(() => {
    const fetchSharesReadyToWithdraw = async () => {
      const balance = await getBalanceOf();
      setSharesReadyToWithdraw(balance);
    };
    fetchSharesReadyToWithdraw();
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
                operation === "deposit" ? walletBalance : sharesReadyToWithdraw
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
