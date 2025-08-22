import ArrowDownIcon from "@/app/components/icons/ArrowDownIcon";
import ArrowUpIcon from "@/app/components/icons/ArrowUpIcon";
import { useBalancesContext } from "@/context/BalancesContext";
import { useSafeLinkedAccountContext } from "@/context/SafeLinkedAccountContext";
import { useTheme } from "@/context/ThemeContext";
import { useTransaction } from "@/context/TransactionContext";
import { useVaults } from "@/context/VaultContext";
import { useView } from "@/context/ViewContext";
import { useSupply } from "@/lib/contracts/hooks/useSupply";
import { VaultsDataView } from "@/lib/data/types/DataPresenter.types";
import { getTypedChainId } from "@/lib/utils/chain";
import { getEnvVars } from "@/lib/utils/env";
import { useAppKitNetwork } from "@reown/appkit/react";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BaseActionKey, createActions } from "./ui/common/Action";
import Button from "./ui/common/Button";
import { CardRow } from "./ui/common/Card";
import Dialog, {
  DialogActionButtons,
  DialogContents,
} from "./ui/common/Dialog";
import Input from "./ui/common/Input";
import LoadingComponent from "./ui/common/LoadingComponent";
import ObservationCard from "./ui/common/ObservationCard";
import Select from "./ui/common/Select";
import Toast, { ToastType } from "./ui/common/Toast";
import TokenCard from "./ui/common/TokenCard";
import WarningCard from "./ui/common/WarningCard";
import { useActionSlot } from "./ui/layout/ActionSlotProvider";

export default function SmartAccountView() {
  const { address } = useParams();
  const network = useAppKitNetwork();
  const { isDeployed } = useSafeLinkedAccountContext();
  const { vaults, isLoading } = useVaults();
  const queryClient = useQueryClient();
  const { isChangingView, setViewLoaded } = useView();
  const vaultsData: VaultsDataView[] | undefined = useMemo(
    () => vaults?.vaultsData,
    [vaults?.vaultsData]
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
  } = getEnvVars(getTypedChainId(Number(network.chainId)));

  const [vaultsIds, setVaultsIds] = useState<string[]>([]);
  const [displayLabels, setDisplayLabels] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    const displayLabels: Record<string, string> = {};
    const vaultsIds: string[] = [];

    vaultsData?.forEach((vault) => {
      vaultsIds.push(vault.staticData.vault_id);
      displayLabels[vault.staticData.vault_id] = vault.staticData.token_symbol;
    });

    if (isUnderlyingWrapNative) {
      vaultsIds.push(underlyingNativeTokenSymb);
      displayLabels[underlyingNativeTokenSymb] = underlyingNativeTokenSymb;
    }
    setVaultsIds(vaultsIds);
    setDisplayLabels(displayLabels);
  }, [vaultsData]);

  const [selectedVaultId, setSelectedVaultId] = useState<string>(
    vaultsData ? vaultsData[0].staticData.vault_id : ""
  );
  const [selectedWrapTokenId, setSelectedWrapTokenId] = useState<string>(
    vaultsData ? vaultsData[0].staticData.vault_id : ""
  );
  const {
    walletBalances,
    safeBalances,
    isLoading: isLoadingBalances,
  } = useBalancesContext();
  const [maxBalance, setMaxBalance] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("info");

  useEffect(() => {
    if (!isLoading && vaultsData && address && address !== "") {
      setViewLoaded();
    }
  }, [isLoading, vaultsData, setViewLoaded, address]);

  const handleOperation = (op: SmartAccountActionKey) => {
    setOperation(op);
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    setShowDialog(false);
    if (operation === "SUPPLY") {
      try {
        // Show the overlay
        showTransaction(
          "Processing Deposit",
          "Please wait while we process your deposit request..."
        );

        const wrapNativeToken =
          isUnderlyingWrapNative &&
          selectedVaultId === underlyingNativeTokenSymb;

        const token = vaultsData?.find((vault) =>
          wrapNativeToken
            ? vault.staticData.vault_id === selectedWrapTokenId
            : vault.staticData.vault_id === selectedVaultId
        );

        if (!token) {
          throw new Error("Token not found");
        }

        // Execute transaction
        const tx = await submitSupplyOnSafe(
          token.staticData.token_address,
          token.staticData.token_decimals,
          amount,
          wrapNativeToken
        );

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
          isUnderlyingWrapNative &&
          selectedVaultId !== underlyingNativeTokenSymb;
        // Show the overlay
        showTransaction(
          "Processing Withdraw",
          "Please wait while we process your withdraw request..."
        );

        const token = vaultsData?.find(
          (vault) => vault.staticData.vault_id === selectedVaultId
        );
        // Execute transaction
        const tx = await withdrawSupplyFromSafe(
          token!.staticData.token_address,
          token!.staticData.token_decimals,
          amount,
          unwrapNativeToken
        );

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
    setShowToast(false);
    if (isUnderlyingWrapNative) {
      if (e.target.value === underlyingNativeTokenSymb) {
        if (operation === "SUPPLY") {
          setToastMessage(
            `${underlyingNativeTokenSymb} will be wrapped to ${displayLabels[selectedWrapTokenId]}.`
          );
          setToastType("info");
          setShowToast(true);
        }
      } else {
        if (operation === "EXIT") {
          setToastMessage(
            `${
              displayLabels[e.target.value]
            } will be unwrapped to ${underlyingNativeTokenSymb}.`
          );
          setToastType("info");
          setShowToast(true);
        }
      }
    }
    setSelectedVaultId(e.target.value);
  };

  const handleWrapSelectionChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (isUnderlyingWrapNative) {
      if (operation === "SUPPLY") {
        setToastMessage(
          `${underlyingNativeTokenSymb} will be wrapped to ${
            displayLabels[e.target.value]
          }.`
        );
        setToastType("info");
        setShowToast(true);
      }
    }
    setSelectedWrapTokenId(e.target.value);
  };

  const renderTokenCard = (fund: VaultsDataView) => {
    if (!fund || !safeBalances || !vaultsData) return null;
    return (
      <TokenCard
        key={fund.staticData.vault_id}
        title={`${fund.staticData.token_symbol}`}
        //subtitle={`${fund.vaultData.aprRaw}% APY (12h avg)`}
        //secondSubtitle={`${fund.vaultData.positionRaw} ${fund.staticData.token_symbol}`}
        //onClick={() => {}}
        icon={
          <Image
            src={fund.staticData.vault_icon}
            alt={fund.staticData.vault_name}
            className="w-12 h-12 object-cover rounded-full"
            width={32}
            height={32}
          />
        }
        active={fund.staticData.vault_status === "open"}
      >
        <CardRow
          left="Available supply"
          right={`${
            safeBalances.vaultBalances[fund.staticData.vault_id].availableSupply
          } ${fund.staticData.token_symbol}`}
        />
        <CardRow
          left="Your shares"
          right={`${
            safeBalances.vaultBalances[fund.staticData.vault_id].shares
          } ${fund.staticData.vault_symbol}`}
        />
      </TokenCard>
    );
  };

  useEffect(() => {
    if (!!selectedVaultId) {
      const maxBalance =
        !walletBalances || !safeBalances
          ? ""
          : operation === "SUPPLY"
          ? selectedVaultId !== underlyingNativeTokenSymb
            ? walletBalances.vaultTokenBalances[selectedVaultId].balance
            : walletBalances.nativeBalance
          : selectedVaultId !== underlyingNativeTokenSymb
          ? safeBalances.vaultBalances[selectedVaultId].availableSupply
          : safeBalances.nativeBalance;
      setMaxBalance(maxBalance);
    }
  }, [selectedVaultId, operation, walletBalances, safeBalances]);

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

  if (
    isLoading ||
    isChangingView ||
    !vaultsData ||
    !safeBalances ||
    !walletBalances ||
    isLoadingBalances
  ) {
    return <LoadingComponent text="Loading account data..." />;
  }

  return (
    <>
      {isDeployed ? (
        <>
          {vaultsData.map((vault) => (
            <div key={vault.staticData.vault_id} className="w-full">
              {renderTokenCard(vault)}
            </div>
          ))}
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
        </div>
      )}

      {/* Dialog */}
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        title={
          operation === "SUPPLY"
            ? `Deposit`
            : operation === "EXIT"
            ? `Withdraw`
            : `Create DAMM Account`
        }
      >
        <DialogContents>
          {(operation === "SUPPLY" || operation === "EXIT") && (
            <>
              <Select
                label="Token"
                options={
                  operation === "EXIT"
                    ? vaultsIds.filter(
                        (vaultId) => vaultId !== underlyingNativeTokenSymb
                      )
                    : vaultsIds
                }
                displayLabels={displayLabels}
                value={selectedVaultId}
                onChange={handleSelectionChange}
              />

              <Input
                type="number"
                label={"Amount"}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                handleMaxClick={() => setAmount(maxBalance)}
                labelMax={
                  <>
                    Max: {maxBalance} {displayLabels[selectedVaultId]}
                  </>
                }
                placeholder="0.0"
              />
            </>
          )}
          {operation === "SUPPLY" && (
            <>
              {isUnderlyingWrapNative &&
                selectedVaultId === underlyingNativeTokenSymb && (
                  <Select
                    label="Wrap Token"
                    options={vaultsIds.filter(
                      (vaultId) => vaultId !== underlyingNativeTokenSymb
                    )}
                    displayLabels={displayLabels}
                    value={selectedWrapTokenId}
                    onChange={handleWrapSelectionChange}
                  />
                )}
              <WarningCard title="Disclaimer">
                You will be able to:
                <br />- Deposit {displayLabels[selectedVaultId]} tokens and
                manage positions in our investment funds.
                <br />- Withdraw at anytime, receiving back the assets to your
                wallet.
              </WarningCard>
            </>
          )}

          {operation === "EXIT" && (
            <>
              <ObservationCard title="Withdraw Process">
                In this process your available deposit of{" "}
                {displayLabels[selectedVaultId]} tokens will be returned to your
                wallet.
              </ObservationCard>
              {isUnderlyingWrapNative && (
                <WarningCard title="Withdraw Disclaimer">
                  You will need to approve the swap of your{" "}
                  {displayLabels[selectedVaultId]} tokens into{" "}
                  {underlyingNativeTokenSymb}.
                </WarningCard>
              )}
            </>
          )}
          {operation === "CREATE" && (
            <>
              <ObservationCard title="Create Account">
                You will be able to:
                <br />- Deposit {displayLabels[selectedVaultId]} tokens to your
                DAMM account.
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
              ? "Deposit"
              : operation === "EXIT"
              ? "Withdraw"
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
  );
}
