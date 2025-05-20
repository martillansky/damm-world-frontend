import { useEffect, useState } from "react";
import ArrowDownIcon from "./icons/ArrowDownIcon";
import ArrowRightIcon from "./icons/ArrowRightIcon";
import RedeemIcon from "./icons/RedeemIcon";
import Button from "./ui/common/Button";
import Card, { CardRow } from "./ui/common/Card";
import Dialog, {
  DialogActionButtons,
  DialogContents,
} from "./ui/common/Dialog";
import Input from "./ui/common/Input";
import WarningCard from "./ui/common/WarningCard";
import { useActionSlot } from "./ui/layout/ActionSlotProvider";

export default function PositionView({ address }: { address: string }) {
  console.log("address", address);
  const { setActions } = useActionSlot();
  const [showDialog, setShowDialog] = useState(false);
  const [operation, setOperation] = useState<
    "claim" | "send" | "redeem" | null
  >(null);
  const [amount, setAmount] = useState("");
  const [recipientWallet, setRecipientWallet] = useState("");
  const vWldBalance = "50"; // This would come from your wallet connection
  const redeemableBalance = "100"; // This would come from your wallet connection

  const handleOperation = (op: "claim" | "send" | "redeem") => {
    setOperation(op);
    setShowDialog(true);
  };

  const handleSubmit = () => {
    // Here you would handle the actual claim/send/redeem operation
    console.log(
      `${operation} ${amount} ${operation === "redeem" ? "WLD" : "vWLD"}`
    );
    setShowDialog(false);
    setAmount("");
    setOperation(null);
  };

  const handleMaxClick = () => {
    setAmount(operation === "redeem" ? redeemableBalance : vWldBalance);
  };

  useEffect(() => {
    setActions(
      <>
        <Button onClick={() => handleOperation("redeem")}>
          <RedeemIcon />
          <span>Redeem</span>
        </Button>
        <Button onClick={() => handleOperation("claim")}>
          <ArrowDownIcon />
          <span>Claim</span>
        </Button>
        <Button onClick={() => handleOperation("send")}>
          <ArrowRightIcon />
          <span>Send</span>
        </Button>
      </>
    );
    return () => setActions(null); // Clean up when component unmounts
  }, [setActions]);

  return (
    <>
      <Card title="Distribution" variant="small">
        <CardRow
          left="Total Value"
          right="200 WLD"
          secondaryRight="≈ $412.00"
        />
        <CardRow left="WLD Balance" right="175 WLD" />
        <CardRow left="USDC Balance" right="50 USDC" />
      </Card>

      <Card title="Redeemable Assets" variant="small">
        <CardRow
          left="Available to Redeem"
          tooltip="Assets available to redeem after withdrawal requests are settled"
          right="100 WLD"
          highlightedRight
          secondaryRight="≈ $206.00"
        />
      </Card>

      <Card title="Share Information" variant="small">
        <CardRow
          left="Vault Share"
          tooltip="Proportional ownership of the total assets in this vault"
          right="0.15%"
        />
        <CardRow
          left="Claimable Shares"
          tooltip="Shares that can be claimed after deposit requests are settled"
          right="25 vWLD"
          highlightedRight
        />
        <CardRow
          left="Shares in Wallet"
          tooltip="Shares that are currently in your wallet"
          right="50 vWLD"
        />
      </Card>

      {/* Dialog */}
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        title={
          operation === "claim"
            ? "Claim vWLD"
            : operation === "redeem"
            ? "Redeem WLD"
            : "Send vWLD"
        }
      >
        <DialogContents>
          <Input
            type="number"
            label={`Amount (${operation === "redeem" ? "WLD" : "vWLD"})`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            handleMaxClick={handleMaxClick}
            labelMax={`Max: ${
              operation === "redeem" ? redeemableBalance : vWldBalance
            }${" "}
              ${operation === "redeem" ? "WLD" : "vWLD"}`}
            placeholder="0.0"
          />

          {operation === "send" && (
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
                <br />• Exclude them from your total vault share and redeemable
                assets
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
            {operation === "claim"
              ? "Claim"
              : operation === "redeem"
              ? "Redeem"
              : "Send"}
          </Button>
        </DialogActionButtons>
      </Dialog>
    </>
  );
}
