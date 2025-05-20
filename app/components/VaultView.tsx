import ArrowDownIcon from "@/app/components/icons/ArrowDownIcon";
import ArrowUpIcon from "@/app/components/icons/ArrowUpIcon";
import { useEffect, useState } from "react";
import Button from "./ui/common/Button";
import Card, { CardRow } from "./ui/common/Card";
import Dialog, {
  DialogActionButtons,
  DialogContents,
} from "./ui/common/Dialog";
import Input from "./ui/common/Input";
import ObservationCard from "./ui/common/ObservationCard";
import WarningCard from "./ui/common/WarningCard";
import { useActionSlot } from "./ui/layout/ActionSlotProvider";

export default function VaultView({ address }: { address: string }) {
  console.log("address", address);
  const { setActions } = useActionSlot();
  const [showDialog, setShowDialog] = useState(false);
  const [operation, setOperation] = useState<"deposit" | "withdraw" | null>(
    null
  );
  const [amount, setAmount] = useState("");
  const walletBalance = "200"; // This would come from your wallet connection

  const handleOperation = (op: "deposit" | "withdraw") => {
    setOperation(op);
    setShowDialog(true);
  };

  const handleSubmit = () => {
    // Here you would handle the actual deposit/withdraw operation
    console.log(`${operation} ${amount} WLD`);
    setShowDialog(false);
    setAmount("");
    setOperation(null);
  };

  const handleMaxClick = () => {
    setAmount(walletBalance);
  };

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

  return (
    <>
      <Card
        title="Vault Overview"
        subtitle="Performance metrics for this liquidity vault"
        variant="large"
      >
        <CardRow left="TVL" right="$133,000" secondaryRight="(+2.3%)" />
        <CardRow
          left="APR (7 day avg)"
          tooltip="Average annual percentage rate based on the last 7 days of performance."
          highlightedRight
          right="6.2%"
          secondaryRight="(+0.5%)"
        />
        <CardRow
          left="Value Gained"
          right="12.4 WLD"
          highlightedRight
          secondaryRight="≈ $25.5"
        />
        <CardRow
          left="Your Position"
          right="200 WLD"
          secondaryRight="≈ $412.00"
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
            labelMax={`Max: ${walletBalance} WLD`}
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
    </>
  );
}
