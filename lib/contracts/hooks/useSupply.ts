import { useSafeLinkedAccountContext } from "@/context/SafeLinkedAccountContext";
import { TransactionResponse } from "@ethersproject/providers";
import { useAppKitNetwork } from "@reown/appkit/react";
import { useAccount } from "wagmi";
import { unwrapWETH, wrapNativeETH } from "../utils/TokenUtils";

export function useSupply() {
  const { address } = useAccount();
  const network = useAppKitNetwork();
  const {
    safeAddress,
    isLoading,
    error,
    executeFundSmartAccountWorkflow,
    executeExitWorkflow,
    deploySafeAsSpender,
  } = useSafeLinkedAccountContext();

  const createAccount = async () => {
    if (!address) throw new Error("No address found");
    if (!safeAddress || isLoading || error) throw new Error("Safe not linked");

    const tx = await deploySafeAsSpender();
    return tx as unknown as TransactionResponse;
  };

  const submitSupplyOnSafe = async (
    tokenAddress: string,
    tokenDecimals: number,
    amount: string,
    wrapNativeToken: boolean
  ) => {
    if (!address) throw new Error("No address found");
    if (!safeAddress || isLoading || error) throw new Error("Safe not linked");

    if (wrapNativeToken) {
      // Wrap native token to WETH: must be triggered by user
      await wrapNativeETH(network.chainId!.toString(), amount);
    }

    const tx = await executeFundSmartAccountWorkflow(
      tokenAddress,
      tokenDecimals,
      amount
    );
    return tx as unknown as TransactionResponse;
  };

  const withdrawSupplyFromSafe = async (
    tokenAddress: string,
    tokenDecimals: number,
    amount: string,
    unwrapNativeToken: boolean
  ) => {
    if (!address) throw new Error("No address found");
    if (!safeAddress || isLoading || error) throw new Error("Safe not linked");

    const tx = await executeExitWorkflow(tokenAddress, tokenDecimals, amount);

    if (unwrapNativeToken) {
      // Unwrap WETH to native token
      await tx.wait();
      await unwrapWETH(network.chainId!.toString(), amount);
    }
    return tx as unknown as TransactionResponse;
  };

  return {
    submitSupplyOnSafe,
    withdrawSupplyFromSafe,
    createAccount,
  };
}
