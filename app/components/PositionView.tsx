import { useVault } from "@/context/VaultContext";
import { useView } from "@/context/ViewContext";
import { useWithdraw } from "@/lib/contracts/hooks/useWithdraw";
import { PositionDataView } from "@/lib/data/types/DataPresenter.types";
import { useEffect, useMemo, useState } from "react";
/* import ArrowDownIcon from "./icons/ArrowDownIcon";
import ArrowRightIcon from "./icons/ArrowRightIcon"; */
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import RedeemIcon from "./icons/RedeemIcon";
import { BaseActionKey, createActions } from "./ui/common/Action";
import Button from "./ui/common/Button";
import Card, { CardRow } from "./ui/common/Card";
import Dialog, {
  DialogActionButtons,
  DialogContents,
} from "./ui/common/Dialog";
import Input from "./ui/common/Input";
import LoadingComponent from "./ui/common/LoadingComponent";
import Toast, { ToastType } from "./ui/common/Toast";
import WarningCard from "./ui/common/WarningCard";
import { useActionSlot } from "./ui/layout/ActionSlotProvider";

export default function PositionView() {
  const { address } = useParams();
  const { vault, isLoading } = useVault();
  const queryClient = useQueryClient();
  const { isChangingView, setViewLoaded } = useView();
  const positionData: PositionDataView | undefined = useMemo(
    () => vault?.positionData,
    [vault?.positionData]
  );
  const { submitRedeem } = useWithdraw();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("info");

  const { setActions } = useActionSlot();
  const [showDialog, setShowDialog] = useState(false);
  type PositionActionKey = BaseActionKey & ("REDEEM" | "CLAIM" | "SEND");
  const [operation, setOperation] = useState<PositionActionKey | null>(null);

  const [amount, setAmount] = useState("");
  const [recipientWallet, setRecipientWallet] = useState("");

  useEffect(() => {
    if (!isLoading && positionData) {
      setViewLoaded();
    }
  }, [isLoading, positionData, setViewLoaded]);

  const handleOperation = (op: PositionActionKey) => {
    setOperation(op);
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    setShowDialog(false);
    if (operation === "REDEEM") {
      try {
        const tx = await submitRedeem(amount);
        setToastMessage("Redeem request submitted!");
        setToastType("info");
        setShowToast(true);

        await tx.wait();
        setToastMessage("Redeem request confirmed!");
        setToastType("success");
        setShowToast(true);
      } catch (error) {
        console.error("Error in redeem process:", error);
        setToastMessage("Error submitting redeem request");
        setToastType("error");
        setShowToast(true);
      }
    }
    setAmount("");
    setOperation(null);
    // Invalidate and refetch vault data
    queryClient.invalidateQueries({ queryKey: ["vaultData", address] });
  };

  const handleMaxClick = () => {
    setAmount(
      operation === "REDEEM"
        ? positionData!.availableToRedeemRaw.toString()
        : ""
    );
  };

  useEffect(() => {
    const actions = createActions(["REDEEM" /* "CLAIM", "SEND" */], {
      REDEEM: {
        label: "Redeem",
        icon: <RedeemIcon />,
        onClick: () => handleOperation("REDEEM"),
      },
      /* CLAIM: {
        label: "Claim",
        icon: <ArrowDownIcon />,
        onClick: () => handleOperation("CLAIM"),
      },
      SEND: {
        label: "Send",
        icon: <ArrowRightIcon />,
        onClick: () => handleOperation("SEND"),
      }, */
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

  if (isLoading || isChangingView || !positionData) {
    return <LoadingComponent text="Loading position data..." />;
  }

  return (
    positionData && (
      <>
        <Card title="Distribution" variant="small">
          <CardRow
            left="Total Value"
            right={positionData?.totalValue}
            secondaryRight={positionData?.totalValueUSD}
          />
          <CardRow left="WLD Balance" right={positionData?.wldBalance} />
          <CardRow left="USDC Balance" right={positionData?.usdcBalance} />
        </Card>

        <Card title="Redeemable Assets" variant="small">
          <CardRow
            left="Available to Redeem"
            tooltip="Assets available to redeem after withdrawal requests are settled"
            right={positionData?.availableToRedeem}
            highlightedRight
            secondaryRight={positionData?.availableToRedeemUSD}
          />
        </Card>

        <Card title="Share Information" variant="small">
          <CardRow
            left="Vault Share"
            tooltip="Proportional ownership of the total assets in this vault"
            right={positionData?.vaultShare}
          />
          {/* <CardRow
            left="Claimable Shares"
            tooltip="Shares that can be claimed after deposit requests are settled"
            right={positionData?.claimableShares}
            highlightedRight
          /> */}
          <CardRow
            left="Shares in Wallet"
            tooltip="Shares that are currently in your wallet"
            right={positionData?.sharesInWallet}
          />
        </Card>

        {/* Dialog */}
        <Dialog
          open={showDialog}
          onClose={() => setShowDialog(false)}
          title={
            operation === "CLAIM"
              ? "Claim vWLD"
              : operation === "REDEEM"
              ? "Redeem WLD"
              : "Send vWLD"
          }
        >
          <DialogContents>
            <Input
              type="number"
              label={`Amount (${operation === "REDEEM" ? "WLD" : "vWLD"})`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              handleMaxClick={handleMaxClick}
              labelMax={`Max: ${
                operation === "REDEEM" ? positionData!.availableToRedeemRaw : ""
              }${" "}
              ${operation === "REDEEM" ? "WLD" : "vWLD"}`}
              placeholder="0.0"
            />

            {operation === "SEND" && (
              <>
                <Input
                  type="text"
                  label="Recipient Wallet"
                  value={recipientWallet}
                  onChange={(e) => setRecipientWallet(e.target.value)}
                  placeholder="0x"
                />
                <WarningCard title="Transfer Disclaimer">
                  Transferring your vault shares (vWLD) to another wallet will:
                  <br />• Remove them from your position
                  <br />• Stop generating yield
                  <br />• Exclude them from your total vault share and
                  redeemable assets
                  <br />
                  <br />
                  This action is irreversible. Make sure you understand the
                  consequences before proceeding.
                </WarningCard>
              </>
            )}
          </DialogContents>
          <DialogActionButtons>
            <Button variant="secondary" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {operation === "CLAIM"
                ? "Claim"
                : operation === "REDEEM"
                ? "Redeem"
                : "Send"}
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
