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
  } = useSafeLinkedAccountContext();

  const submitSupplyOnSafe = async (
    amount: string,
    wrapNativeToken: boolean
  ) => {
    if (!address) throw new Error("No address found");
    if (!safeAddress || isLoading || error) throw new Error("Safe not linked");

    if (wrapNativeToken) {
      // Wrap native token to WETH: must be triggered by user
      await wrapNativeETH(network.chainId!.toString(), amount);
    }

    const tx = await executeFundSmartAccountWorkflow(amount);
    return tx as unknown as TransactionResponse;
  };

  const withdrawSupplyFromSafe = async (
    amount: string,
    unwrapNativeToken: boolean
  ) => {
    if (!address) throw new Error("No address found");
    if (!safeAddress || isLoading || error) throw new Error("Safe not linked");

    const tx = await executeExitWorkflow(amount);

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
  };
}
