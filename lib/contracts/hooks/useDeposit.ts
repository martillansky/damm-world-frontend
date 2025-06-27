import { TransactionResponse } from "@ethersproject/providers";
import { useAppKitNetwork } from "@reown/appkit/react";
import { parseUnits } from "ethers/lib/utils";
import { useAccount } from "wagmi";
import { handleApprove, wrapNativeETH } from "../utils/TokenUtils";
import { getSignerAndContract } from "../utils/utils";

export function useDeposit() {
  const { address } = useAccount();
  const network = useAppKitNetwork();

  const cancelDepositRequest = async () => {
    if (!address) throw new Error("No address found");

    const chainId = network.chainId?.toString() ?? "";
    const { vault } = await getSignerAndContract(chainId);

    const tx = await vault.cancelRequestDeposit();
    return tx as unknown as TransactionResponse;
  };

  const submitRequestDeposit = async (
    amount: string,
    wrapNativeToken: boolean
  ) => {
    if (!address) throw new Error("No address found");

    const chainId = network.chainId?.toString() ?? "";
    const { vault, tokenMetadata } = await getSignerAndContract(chainId);

    if (wrapNativeToken) {
      await wrapNativeETH(chainId, amount);
    }

    const amountInWei = parseUnits(amount, tokenMetadata.decimals);
    await handleApprove(chainId, address, vault.address, amountInWei);
    const tx = await vault["requestDeposit(uint256,address,address,address)"](
      amountInWei,
      address,
      address,
      address
    );
    return tx as unknown as TransactionResponse;
  };

  return { submitRequestDeposit, cancelDepositRequest };
}
