import { useSafeLinkedAccountContext } from "@/context/SafeLinkedAccountContext";
import { TransactionResponse } from "@ethersproject/providers";
import { useAppKitNetwork } from "@reown/appkit/react";
import { SafeTransactionDataPartial } from "@safe-global/types-kit";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { useAccount } from "wagmi";
import VaultABI from "../abis/VaultForked.json";
import { getApproveTx } from "../utils/TokenUtils";
import { getSignerAndContract } from "../utils/utils";

export function useDeposit() {
  const { address } = useAccount();
  const network = useAppKitNetwork();
  const { safeAddress, isLoading, error, executeSafeTransaction } =
    useSafeLinkedAccountContext();

  const cancelDepositRequest = async (vaultAddress: string) => {
    if (!address) throw new Error("No address found");

    const chainId = network.chainId?.toString() ?? "";
    const { signer } = await getSignerAndContract(chainId);

    const txs: SafeTransactionDataPartial[] = [];

    const cancelDepositRequestCall = {
      to: vaultAddress,
      value: "0",
      data: new Contract(
        vaultAddress,
        VaultABI,
        signer
      ).interface.encodeFunctionData("cancelRequestDeposit"),
    };
    txs.push(cancelDepositRequestCall);

    try {
      const txResponse = await executeSafeTransaction(txs);
      return txResponse as unknown as TransactionResponse;
    } catch (error) {
      console.error("Error executing safe transaction:", error);
      throw new Error("Cannot execute cancel deposit request");
    }
  };

  const submitRequestDeposit = async (
    vaultAddress: string,
    underlyingTokenAddress: string,
    tokenDecimals: number,
    amount: string
  ) => {
    if (!address || !network.chainId) throw new Error("Failed connection");
    if (!safeAddress || isLoading || error) throw new Error("Safe not linked");

    const txs: SafeTransactionDataPartial[] = [];
    const chainId = network.chainId.toString();
    const { signer } = await getSignerAndContract(chainId);

    const amountInWei = parseUnits(amount, tokenDecimals);

    // Approve tokens to be transferred from safe to the vault
    const approveTx = await getApproveTx(
      safeAddress,
      vaultAddress,
      underlyingTokenAddress,
      BigNumber.from(amountInWei)
    );
    if (approveTx) {
      txs.push({
        to: approveTx.target,
        value: "0",
        data: approveTx.callData,
      });
    }

    // Request deposit
    const requestDepositCall = {
      to: vaultAddress,
      value: "0",
      data: new Contract(
        vaultAddress,
        VaultABI,
        signer
      ).interface.encodeFunctionData(
        "requestDeposit(uint256,address,address,address)",
        [amountInWei, safeAddress, safeAddress, safeAddress]
      ),
    };
    txs.push(requestDepositCall);

    try {
      const txResponse = await executeSafeTransaction(txs);
      return txResponse as unknown as TransactionResponse;
    } catch (error) {
      console.error("Error executing safe transaction:", error);
      throw new Error("Cannot execute deposit request");
    }
  };

  return {
    submitRequestDeposit,
    cancelDepositRequest,
  };
}
