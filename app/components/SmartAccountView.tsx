import ArrowDownIcon from "@/app/components/icons/ArrowDownIcon";
import ArrowUpIcon from "@/app/components/icons/ArrowUpIcon";
import { useSafeLinkedAccountContext } from "@/context/SafeLinkedAccountContext";
import { useTheme } from "@/context/ThemeContext";
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
  const { submitRequestDepositOnSafe } = useDeposit();
  const { submitRequestWithdraw } = useWithdraw();
  const { theme } = useTheme();
  const { setActions } = useActionSlot();
  const [showDialog, setShowDialog] = useState(false);

  type SmartAccountActionKey = BaseActionKey & ("SUPPLY" | "EXIT");
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
  const { getBalanceOf, getNativeBalance, getUnderlyingBalanceOf } =
    useBalanceOf();
  const [walletBalance, setWalletBalance] = useState<string>("");
  const [walletNativeBalance, setWalletNativeBalance] = useState<string>("");
  const [sharesReadyToWithdraw, setSharesReadyToWithdraw] =
    useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("info");

  useEffect(() => {
    const retrieveNativeBalance = async () => {
      const nativeBalance = await getNativeBalance();
      setWalletNativeBalance(nativeBalance);
    };

    if (!isLoading && vaultData) {
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
        const tx = await submitRequestDepositOnSafe(amount, wrapNativeToken);
        setToastMessage("Supply request submitted!");
        setToastType("info");
        setShowToast(true);

        await tx.wait();
        setToastMessage("Supply request confirmed!");
        setToastType("success");
        setShowToast(true);
      } catch (error) {
        console.error("Error in supply process:", error);
        setToastMessage("Error submitting supply request");
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
    // Invalidate and refetch vault data
    queryClient.invalidateQueries({ queryKey: ["vaultData", address] });
  };

  const handleMaxClick = () => {
    setAmount(
      operation === "SUPPLY"
        ? selectedToken === underlyingTokenSymb
          ? walletBalance
          : walletNativeBalance
        : sharesReadyToWithdraw
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

    if (address) {
      fetchUnderlyingBalance();
    } else {
      setWalletBalance("");
    }
  }, [getUnderlyingBalanceOf, address]);

  useEffect(() => {
    const fetchSharesReadyToWithdraw = async () => {
      try {
        const balance = await getBalanceOf();
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
    let actions;
    if (isDeployed) {
      actions = createActions(["SUPPLY", "EXIT"], {
        SUPPLY: {
          label: "Supply",
          icon: <ArrowUpIcon />,
          onClick: () => handleOperation("SUPPLY"),
        },
        EXIT: {
          label: "Exit",
          icon: <ArrowDownIcon />,
          onClick: () => handleOperation("EXIT"),
        },
      });
    } else {
      actions = createActions(["SUPPLY"], {
        SUPPLY: {
          label: "Initial Supply",
          icon: <ArrowUpIcon />,
          onClick: () => handleOperation("SUPPLY"),
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
    return <LoadingComponent text="Loading vault data..." />;
  }

  const safeAddressShort =
    safeAddress?.slice(0, 6) + "..." + safeAddress?.slice(-4);
  const explorerLink = `${
    getEnvVars(getTypedChainId(Number(network.chainId))).BLOCK_EXPLORER_GATEWAY
  }/address/${safeAddress}`;

  return (
    vaultData && (
      <>
        {isDeployed ? (
          <>
            <Card title="Balance" variant="small">
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

            <Card title="Deployment" variant="small">
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
            </Card>
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
                subtitle="Provide an initial supply to deploy your smart account and begin investing in our vaults."
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
              : `Withdraw ${underlyingTokenSymb}`
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
                  onChange={(e) => setSelectedToken(e.target.value)}
                />
              )}
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
                    : sharesReadyToWithdraw + " " + underlyingTokenSymb}
                </>
              }
              placeholder="0.0"
            />

            {operation === "SUPPLY" && (
              <>
                {!isDeployed && (
                  <ObservationCard title="Supply Process">
                    This is a two-step process:
                    <br />
                    1. Your private DAMM investment fund will be deployed.
                    <br />
                    2. We request your authorization in advance to enable your
                    private investment fund to borrow tokens from your wallet at
                    your only request.
                  </ObservationCard>
                )}
                <WarningCard title="Disclaimer">
                  You will be able to:
                  <br />- Supply {underlyingTokenSymb} tokens to your investment
                  fund.
                  <br />
                  - Deposit and manage position in our vaults.
                  <br />- Exit at anytime, receiving back the assets to your
                  wallet.
                </WarningCard>
              </>
            )}

            {operation === "EXIT" && (
              <>
                <ObservationCard title="Exit Process">
                  In this process your available supply of {underlyingTokenSymb}{" "}
                  tokens will deposited back to your wallet.
                </ObservationCard>

                <WarningCard title="Exit Disclaimer">
                  To withdraw your shares, you must complete the required
                  process in the respective vault leaving your supply available
                  for exiting the fund.
                </WarningCard>
              </>
            )}
          </DialogContents>

          <DialogActionButtons>
            <Button variant="secondary" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {operation === "SUPPLY" ? "Supply" : "Exit"}
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
