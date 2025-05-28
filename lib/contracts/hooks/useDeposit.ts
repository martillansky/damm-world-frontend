import { TransactionResponse } from "@ethersproject/providers";
import { useAppKitNetwork } from "@reown/appkit/react";
import { Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { useAccount } from "wagmi";
import { getSignerAndContract, getVaultAddress } from "../utils/utils";

async function _handleApprove(
  chainId: string,
  address: string,
  underlyingToken: Contract,
  amount: string
) {
  const vaultAddress = getVaultAddress(chainId);
  const amountInWei = parseEther(amount);

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
    const { vault, underlyingToken } = await getSignerAndContract(chainId);

    await _handleApprove(chainId, address, underlyingToken, amount);
    const tx = await vault["requestDeposit(uint256,address,address,address)"](
      parseEther(amount),
      address,
      address,
      address
    );
    return tx as unknown as TransactionResponse;
  };

  return { submitRequestDeposit, cancelDepositRequest };
}
