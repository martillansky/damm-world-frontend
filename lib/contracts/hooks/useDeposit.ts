import { TransactionResponse } from "@ethersproject/providers";
import { useAppKitNetwork } from "@reown/appkit/react";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { useAccount } from "wagmi";
import { getSignerAndContract } from "../utils/utils";

async function _handleApprove(
  chainId: string,
  address: string,
  vaultAddress: string,
  amountInWei: BigNumber
) {
  const { underlyingToken } = await getSignerAndContract(chainId);

  const allowance = await underlyingToken.allowance(address, vaultAddress);

  if (allowance.lt(amountInWei)) {
    // User needs to approve the vault to spend the underlying token
    const tx = await underlyingToken.approve(vaultAddress, amountInWei);
    await tx.wait();
  }
}

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

  const submitRequestDeposit = async (amount: string) => {
    if (!address) throw new Error("No address found");

    const chainId = network.chainId?.toString() ?? "";
    const { vault, tokenMetadata } = await getSignerAndContract(chainId);

    const amountInWei = parseUnits(amount, tokenMetadata.decimals);
    await _handleApprove(chainId, address, vault.address, amountInWei);
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
