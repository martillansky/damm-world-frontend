import { useSafeLinkedAccountContext } from "@/context/SafeLinkedAccountContext";
import { TransactionResponse } from "@ethersproject/providers";
import { useAppKitNetwork } from "@reown/appkit/react";
import { SafeTransactionDataPartial } from "@safe-global/types-kit";
import { Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { useAccount } from "wagmi";
import VaultABI from "../abis/Vault.json";
import { getSignerAndContract } from "../utils/utils";

export function useWithdraw() {
  const { address } = useAccount();
  const network = useAppKitNetwork();
  const { safeAddress, isLoading, error, executeSafeTransaction } =
    useSafeLinkedAccountContext();

  const submitRedeem = async (vaultAddress: string, amount: string) => {
    if (!address || !network.chainId) throw new Error("Failed connection");
    if (!safeAddress || isLoading || error) throw new Error("Safe not linked");

    const chainId = network.chainId?.toString() ?? "";
    const { signer } = await getSignerAndContract(chainId);

    const amountInWei = parseEther(amount);

    const txs: SafeTransactionDataPartial[] = [];

    const redeemCall = {
      to: vaultAddress,
      value: "0",
      data: new Contract(
        vaultAddress,
        VaultABI,
        signer
      ).interface.encodeFunctionData("redeem", [
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
  const submitWithdraw = async (vaultAddress: string, amount: string) => {
    if (!address || !network.chainId) throw new Error("Failed connection");
    if (!safeAddress || isLoading || error) throw new Error("Safe not linked");

    const { signer } = await getSignerAndContract(
      network.chainId?.toString() ?? ""
    );

    const amountInWei = parseEther(amount);

    const txs: SafeTransactionDataPartial[] = [];

    const withdrawCall = {
      to: vaultAddress,
      value: "0",
      data: new Contract(
        vaultAddress,
        VaultABI,
        signer
      ).interface.encodeFunctionData("withdraw", [
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

  const submitRequestWithdraw = async (
    vaultAddress: string,
    amount: string
  ) => {
    if (!address || !network.chainId) throw new Error("Failed connection");
    if (!safeAddress || isLoading || error) throw new Error("Safe not linked");

    const { signer } = await getSignerAndContract(
      network.chainId?.toString() ?? ""
    );

    const amountInWei = parseEther(amount);

    const txs: SafeTransactionDataPartial[] = [];

    const claimSharesAndRequestRedeemCall = {
      to: vaultAddress,
      value: "0",
      data: new Contract(
        vaultAddress,
        VaultABI,
        signer
      ).interface.encodeFunctionData("claimSharesAndRequestRedeem", [
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
