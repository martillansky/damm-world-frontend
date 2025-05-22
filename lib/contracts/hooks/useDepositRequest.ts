import { TransactionResponse } from "@ethersproject/providers";
import { useAppKitNetwork } from "@reown/appkit/react";
import { Contract, ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { useAccount } from "wagmi";
import { getSignerAndContract, getVaultAddress } from "../utils/utils";

async function _handleApprove(
  address: string,
  underlyingToken: Contract,
  amount: string
) {
  const vaultAddress = getVaultAddress();
  const amountInWei = parseEther(amount);

  const allowance = await underlyingToken.allowance(address, vaultAddress);
  console.log("Allowance:", ethers.utils.formatEther(allowance));

  if (allowance.lt(amountInWei)) {
    // User needs to approve the vault to spend the underlying token

    console.log("Sending approval tx...");
    const tx = await underlyingToken.approve(vaultAddress, amountInWei);
    console.log("Approval tx sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("Approval confirmed in block:", receipt.blockNumber);
  }
}

export function useDepositRequest() {
  const { address } = useAccount();
  const network = useAppKitNetwork();

  const submitDepositRequest = async (amount: string) => {
    if (!address) throw new Error("No address found");

    const { vault, underlyingToken } = await getSignerAndContract(
      address,
      network.chainId?.toString() ?? ""
    );

    console.log("Checking approval");
    await _handleApprove(address, underlyingToken, amount);

    console.log("Approval ok. Triggering deposit!");
    const tx = await vault["requestDeposit(uint256,address,address,address)"](
      parseEther(amount),
      address,
      address,
      address
    );
    return tx as unknown as TransactionResponse;
  };

  return { submitDepositRequest };
}
