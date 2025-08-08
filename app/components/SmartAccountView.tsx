import ArrowDownIcon from "@/app/components/icons/ArrowDownIcon";
import ArrowUpIcon from "@/app/components/icons/ArrowUpIcon";
import { useSafeLinkedAccountContext } from "@/context/SafeLinkedAccountContext";
import { useTheme } from "@/context/ThemeContext";
import { useTransaction } from "@/context/TransactionContext";
import { useVault } from "@/context/VaultContext";
import { useView } from "@/context/ViewContext";
import { useBalanceOf } from "@/lib/contracts/hooks/useBalanceOf";
import { useSupply } from "@/lib/contracts/hooks/useSupply";
import { VaultDataView } from "@/lib/data/types/DataPresenter.types";
import { getTypedChainId } from "@/lib/utils/chain";
import { getEnvVars } from "@/lib/utils/env";
import { useAppKitNetwork } from "@reown/appkit/react";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
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
import Select from "./ui/common/Select";
import Toast, { ToastType } from "./ui/common/Toast";
import WarningCard from "./ui/common/WarningCard";
import { useActionSlot } from "./ui/layout/ActionSlotProvider";

export default function SmartAccountView() {
  const { address } = useParams();
  const network = useAppKitNetwork();
  const { safeAddress, availableSupply, shares, isDeployed } =
    useSafeLinkedAccountContext();
  const { vault, isLoading } = useVault();
  const queryClient = useQueryClient();
  const { isChangingView, setViewLoaded } = useView();
  const vaultData: VaultDataView | undefined = useMemo(
    () => vault?.vaultData,
    [vault?.vaultData]
  );
  const { submitSupplyOnSafe, withdrawSupplyFromSafe, createAccount } =
    useSupply();
  const { theme } = useTheme();
  const { showTransaction, updateTransactionStatus, hideTransaction } =
    useTransaction();

  const { setActions } = useActionSlot();
  const [showDialog, setShowDialog] = useState(false);

  type SmartAccountActionKey = BaseActionKey & ("SUPPLY" | "EXIT" | "CREATE");
  const [operation, setOperation] = useState<SmartAccountActionKey | null>(
    null
  );
  const [amount, setAmount] = useState("");

  const {
    IS_UNDERLYING_WRAP_NATIVE: isUnderlyingWrapNative,
    UNDERLYING_NATIVE_TOKEN_SYMB: underlyingNativeTokenSymb,
    UNDERLYING_TOKEN_SYMB: underlyingTokenSymb,
    SHARE_TOKEN_SYMB: shareTokenSymb,
  } = getEnvVars(getTypedChainId(Number(network.chainId)));

  const [selectedToken, setSelectedToken] =
    useState<string>(underlyingTokenSymb);
  const {
    getSuppplyBalanceFromSafe,
    getNativeBalance,
    getUnderlyingBalanceOf,
  } = useBalanceOf();
  const [walletBalance, setWalletBalance] = useState<string>("");
  const [walletNativeBalance, setWalletNativeBalance] = useState<string>("");
  const [supplyReadyToWithdraw, setSupplyReadyToWithdraw] =
    useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("info");
  /* const safeAddressShort =
    safeAddress?.slice(0, 6) + "..." + safeAddress?.slice(-4);
  const explorerLink = `${
    getEnvVars(getTypedChainId(Number(network.chainId))).BLOCK_EXPLORER_GATEWAY
  }/address/${safeAddress}`; */

  useEffect(() => {
    const retrieveNativeBalance = async () => {
      try {
        const nativeBalance = await getNativeBalance();
        setWalletNativeBalance(nativeBalance);
      } catch (err) {
        console.warn("Failed to fetch native balance:", err);
        setWalletNativeBalance("");
      }
    };

    if (!isLoading && vaultData && address && address !== "") {
      setViewLoaded();
      if (isUnderlyingWrapNative) {
        retrieveNativeBalance();
      }
    }
  }, [
    isLoading,
    vaultData,
    setViewLoaded,
    isUnderlyingWrapNative,
    getNativeBalance,
    address,
  ]);

  const handleOperation = (op: SmartAccountActionKey) => {
    setOperation(op);
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    setShowDialog(false);
    if (operation === "SUPPLY") {
      try {
        const wrapNativeToken =
          isUnderlyingWrapNative && selectedToken !== underlyingTokenSymb;
        // Show the overlay
        showTransaction(
          "Processing Deposit",
          "Please wait while we process your deposit request..."
        );

        // Execute transaction
        const tx = await submitSupplyOnSafe(amount, wrapNativeToken);

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
    } else if (operation === "EXIT") {
      try {
        const unwrapNativeToken =
          isUnderlyingWrapNative && selectedToken === underlyingTokenSymb;
        // Show the overlay
        showTransaction(
          "Processing Withdraw",
          "Please wait while we process your withdraw request..."
        );

        // Execute transaction
        const tx = await withdrawSupplyFromSafe(amount, unwrapNativeToken);

        // Update status to pending
        updateTransactionStatus(
          "pending",
          "Transaction submitted! Waiting for confirmation..."
        );

        // Wait for confirmation
        await tx.wait();
        // Update to success
        updateTransactionStatus("success", "Withdraw completed successfully!");

        // Hide after 2 seconds
        setTimeout(hideTransaction, 2000);
      } catch (error) {
        console.error("Error in withdraw process:", error);
        // Update to error
        updateTransactionStatus(
          "error",
          "Transaction failed. Please try again."
        );

        // Hide after 3 seconds
        setTimeout(hideTransaction, 3000);
      }
    } else if (operation === "CREATE") {
      try {
        // Show the overlay
        showTransaction(
          "Processing Create Account",
          "Please wait while we process your create account request..."
        );

        // Execute transaction
        const tx = await createAccount();
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
          "DAMM account successfully created!"
        );

        // Hide after 2 seconds
        setTimeout(hideTransaction, 2000);
      } catch (error) {
        console.error("Error in create account process:", error);
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
    queryClient.invalidateQueries({ queryKey: ["vaultData", address] });
  };

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === underlyingNativeTokenSymb) {
      setToastMessage("ETH-SEP will be wrapped to WETH-SEP.");
      setToastType("info");
      setShowToast(true);
    }
    setSelectedToken(e.target.value);
  };

  const handleMaxClick = () => {
    setAmount(
      operation === "SUPPLY"
        ? selectedToken === underlyingTokenSymb
          ? walletBalance
          : walletNativeBalance
        : supplyReadyToWithdraw
    );
  };

  useEffect(() => {
    const fetchUnderlyingBalance = async () => {
      try {
        const balance = await getUnderlyingBalanceOf();
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
  }, [getUnderlyingBalanceOf, address, isLoading]);

  useEffect(() => {
    const fetchSupplyReadyToWithdraw = async () => {
      try {
        const balance = await getSuppplyBalanceFromSafe();
        setSupplyReadyToWithdraw(balance);
      } catch (err) {
        console.warn("Failed to fetch balance:", err);
        setSupplyReadyToWithdraw("");
      }
    };

    if (safeAddress && !isLoading && safeAddress !== "") {
      fetchSupplyReadyToWithdraw();
    } else {
      setSupplyReadyToWithdraw("");
    }
  }, [getSuppplyBalanceFromSafe, safeAddress, isLoading]);

  useEffect(() => {
    let actions;
    if (isDeployed) {
      actions = createActions(["SUPPLY", "EXIT"], {
        SUPPLY: {
          label: "Deposit",
          icon: <ArrowUpIcon />,
          onClick: () => handleOperation("SUPPLY"),
        },
        EXIT: {
          label: "Withdraw",
          icon: <ArrowDownIcon />,
          onClick: () => handleOperation("EXIT"),
        },
      });
    } else {
      actions = createActions(["CREATE"], {
        CREATE: {
          label: "Create Account",
          icon: <ArrowUpIcon />,
          onClick: () => handleOperation("CREATE"),
        },
      });
    }
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
  }, [setActions, isDeployed]);

  if (isLoading || isChangingView || !vaultData) {
    return <LoadingComponent text="Loading account data..." />;
  }

  return (
    vaultData && (
      <>
        {isDeployed ? (
          <>
            <Card title="Balance" variant="large">
              <CardRow
                left="Available supply"
                right={`${availableSupply} ${underlyingTokenSymb}`}
                //secondaryRight={vaultData.positionUSD}
              />
              <CardRow
                left="Your shares"
                right={`${shares} ${shareTokenSymb}`}
                //secondaryRight={vaultData.positionUSD}
              />
            </Card>

            {/* <Card title="Deployment" variant="small">
              <CardRow
                left="Your private fund address"
                right={
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
            </Card> */}
          </>
        ) : (
          <div className="flex flex-col items-center min-h-[calc(100vh-300px)]">
            {/* Logo centered in available space */}
            <div className="flex-1 flex items-center justify-center">
              <Image
                src={
                  theme === "dark"
                    ? "/Damm_Capital_Isotipo_Fondo Oscuro.png"
                    : "/Damm_Capital_Isotipo_Fondo blanco.png"
                }
                alt="Damm Capital Logo"
                className="h-48 w-auto"
                width={356}
                height={356}
              />
            </div>

            {/* Card at the bottom */}
            <div className="flex-1 flex items-center justify-end mb-8">
              <Card
                title="Welcome to DAMM World"
                variant="small"
                subtitle="Create your DAMM account, provide an initial deposit, and begin investing in our funds."
              />
            </div>
          </div>
        )}

        {/* Dialog */}
        <Dialog
          open={showDialog}
          onClose={() => setShowDialog(false)}
          title={
            operation === "SUPPLY"
              ? `Supply ${underlyingTokenSymb}`
              : operation === "EXIT"
              ? `Withdraw ${underlyingTokenSymb}`
              : `Create DAMM Account`
          }
        >
          <DialogContents>
            {operation === "SUPPLY" &&
              !!isUnderlyingWrapNative &&
              isUnderlyingWrapNative && (
                <Select
                  label="Token"
                  options={[underlyingTokenSymb, underlyingNativeTokenSymb]}
                  value={selectedToken}
                  onChange={handleSelectionChange}
                />
              )}
            {operation !== "CREATE" && (
              <Input
                type="number"
                label={`Amount (${
                  operation === "SUPPLY" ? selectedToken : underlyingTokenSymb
                })`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                handleMaxClick={handleMaxClick}
                labelMax={
                  <>
                    Max:{" "}
                    {operation === "SUPPLY"
                      ? selectedToken === underlyingTokenSymb
                        ? walletBalance + " " + underlyingTokenSymb
                        : walletNativeBalance + " " + underlyingNativeTokenSymb
                      : supplyReadyToWithdraw + " " + underlyingTokenSymb}
                  </>
                }
                placeholder="0.0"
              />
            )}
            {operation === "SUPPLY" && (
              <>
                <WarningCard title="Disclaimer">
                  You will be able to:
                  <br />- Deposit {underlyingTokenSymb} tokens and manage
                  positions in our investment funds.
                  <br />- Withdraw at anytime, receiving back the assets to your
                  wallet.
                </WarningCard>
              </>
            )}

            {operation === "EXIT" && (
              <>
                <ObservationCard title="Withdraw Process">
                  In this process your available deposit of{" "}
                  {underlyingTokenSymb} tokens will be returned to your wallet.
                </ObservationCard>
                {isUnderlyingWrapNative && (
                  <WarningCard title="Withdraw Disclaimer">
                    You will need to approve the swap of your{" "}
                    {underlyingTokenSymb} tokens into{" "}
                    {underlyingNativeTokenSymb}.
                  </WarningCard>
                )}
              </>
            )}
            {operation === "CREATE" && (
              <>
                <ObservationCard title="Create Account">
                  You will be able to:
                  <br />- Deposit {underlyingTokenSymb} tokens to your DAMM
                  account.
                  <br />- Invest and manage positions in our funds.
                  <br />- Withdraw at anytime, receiving back the assets to your
                  wallet.
                </ObservationCard>
              </>
            )}
          </DialogContents>

          <DialogActionButtons>
            <Button variant="secondary" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {operation === "SUPPLY"
                ? "Supply"
                : operation === "EXIT"
                ? "Exit"
                : "Create"}
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
