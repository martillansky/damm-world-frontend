import { TransactionResponse } from "@ethersproject/providers";
import { useAppKitNetwork } from "@reown/appkit/react";
import { parseEther } from "ethers/lib/utils";
import { useAccount } from "wagmi";
import { getSignerAndContract } from "../utils/utils";

export function useWithdraw() {
  const { address } = useAccount();
  const network = useAppKitNetwork();
  const safeAddress = process.env.NEXT_PUBLIC_ANVIL_SAFE_ADDRESS;
  const controller = process.env.NEXT_PUBLIC_ANVIL_CONTROLLER;

  if (!safeAddress || !controller)
    throw new Error("Safe address or controller not found");

  const submitRedeem = async (amount: string) => {
    if (!address) throw new Error("No address found");

    const { vault } = await getSignerAndContract(
      network.chainId?.toString() ?? ""
    );

    const tx = await vault.redeem(parseEther(amount), address, address);
    return tx as unknown as TransactionResponse;
  };

  // This should be used instead of submitRequestWithdraw only if the vault
  // has closed state. This is a synchronous operation.
  const submitWithdraw = async (amount: string) => {
    if (!address) throw new Error("No address found");

    const { vault } = await getSignerAndContract(
      network.chainId?.toString() ?? ""
    );

    const tx = await vault.withdraw(parseEther(amount), address, address);
    return tx as unknown as TransactionResponse;
  };

  const submitRequestWithdraw = async (amount: string) => {
    if (!address) throw new Error("No address found");

    const { vault } = await getSignerAndContract(
      network.chainId?.toString() ?? ""
    );

    const amountInWei = parseEther(amount);

    const tx = await vault.requestRedeem(amountInWei, controller, address);
    return tx as unknown as TransactionResponse;
  };

  return { submitRequestWithdraw, submitRedeem, submitWithdraw };
}
