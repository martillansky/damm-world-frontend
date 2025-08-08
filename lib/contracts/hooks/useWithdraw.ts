import { useSafeLinkedAccountContext } from "@/context/SafeLinkedAccountContext";
import { TransactionResponse } from "@ethersproject/providers";
import { useAppKitNetwork } from "@reown/appkit/react";
import { SafeTransactionDataPartial } from "@safe-global/types-kit";
import { parseEther } from "ethers/lib/utils";
import { useAccount } from "wagmi";
import { getSignerAndContract } from "../utils/utils";

export function useWithdraw() {
  const { address } = useAccount();
  const network = useAppKitNetwork();
  const { safeAddress, isLoading, error, executeSafeTransaction } =
    useSafeLinkedAccountContext();

  const submitRedeem = async (amount: string) => {
    if (!address || !network.chainId) throw new Error("Failed connection");
    if (!safeAddress || isLoading || error) throw new Error("Safe not linked");

    const { vault } = await getSignerAndContract(
      network.chainId?.toString() ?? ""
    );

    const amountInWei = parseEther(amount);

    const txs: SafeTransactionDataPartial[] = [];

    const redeemCall = {
      to: vault.address,
      value: "0",
      data: vault.interface.encodeFunctionData("redeem", [
        amountInWei,
        safeAddress,
        safeAddress,
      ]),
    };
    txs.push(redeemCall);

    try {
      const txResponse = await executeSafeTransaction(txs);
      return txResponse as unknown as TransactionResponse;
    } catch (error) {
      console.error("Error executing safe transaction:", error);
      throw new Error("Cannot execute redeem");
    }
  };

  // This should be used instead of submitRequestWithdraw only if the vault
  // has closed state. This is a synchronous operation.
  const submitWithdraw = async (amount: string) => {
    if (!address || !network.chainId) throw new Error("Failed connection");
    if (!safeAddress || isLoading || error) throw new Error("Safe not linked");

    const { vault } = await getSignerAndContract(
      network.chainId?.toString() ?? ""
    );

    const amountInWei = parseEther(amount);

    const txs: SafeTransactionDataPartial[] = [];

    const withdrawCall = {
      to: vault.address,
      value: "0",
      data: vault.interface.encodeFunctionData("withdraw", [
        amountInWei,
        safeAddress,
        safeAddress,
      ]),
    };
    txs.push(withdrawCall);

    try {
      const txResponse = await executeSafeTransaction(txs);
      return txResponse as unknown as TransactionResponse;
    } catch (error) {
      console.error("Error executing safe transaction:", error);
      throw new Error("Cannot execute withdraw");
    }
  };

  const submitRequestWithdraw = async (amount: string) => {
    if (!address || !network.chainId) throw new Error("Failed connection");
    if (!safeAddress || isLoading || error) throw new Error("Safe not linked");

    const { vault } = await getSignerAndContract(
      network.chainId?.toString() ?? ""
    );

    const amountInWei = parseEther(amount);

    const txs: SafeTransactionDataPartial[] = [];

    const claimSharesAndRequestRedeemCall = {
      to: vault.address,
      value: "0",
      data: vault.interface.encodeFunctionData("claimSharesAndRequestRedeem", [
        amountInWei,
      ]),
    };
    txs.push(claimSharesAndRequestRedeemCall);

    try {
      const txResponse = await executeSafeTransaction(txs);
      return txResponse as unknown as TransactionResponse;
    } catch (error) {
      console.error("Error executing safe transaction:", error);
      throw new Error("Cannot execute claim shares and request redeem");
    }
  };

  return { submitRequestWithdraw, submitRedeem, submitWithdraw };
}
