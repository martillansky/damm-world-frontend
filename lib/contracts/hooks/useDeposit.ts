import { TransactionResponse } from "@ethersproject/providers";
import { useAppKitNetwork } from "@reown/appkit/react";
import { parseUnits } from "ethers/lib/utils";
import { useAccount } from "wagmi";
import { batchTxs, Call, MULTICALL3_ADDRESS } from "../utils/BatchTxs";
import {
  getApproveTx,
  handleApprove,
  wrapNativeETH,
} from "../utils/TokenUtils";
import { getSignerAndContract } from "../utils/utils";
import { useSafeLinkedAccount } from "./useSafeLinkedAccount";

export function useDeposit() {
  const { address } = useAccount();
  const network = useAppKitNetwork();
  const { safeAddress, isDeployed, isLoading, executeDepositRequestWorkflow } =
    useSafeLinkedAccount();

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

  const submitRequestDepositOnMulticall = async (
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
    const calls: Call[] = [];

    const setOperatorTx = await vault.setOperator(MULTICALL3_ADDRESS, true);
    await setOperatorTx.wait();
    console.log("setOperatorTx", setOperatorTx);

    /* const setOperatorCall = {
      target: vault.address,
      allowFailure: false,
      callData: vault.interface.encodeFunctionData("setOperator", [
        MULTICALL3_ADDRESS,
        true,
      ]),
    };
    calls.push(setOperatorCall); */

    const approveTx = await getApproveTx(
      chainId,
      address,
      vault.address,
      amountInWei
    );
    if (approveTx) {
      calls.push(approveTx);
    }
    const requestDepositCall = {
      target: vault.address,
      allowFailure: false,
      callData: vault.interface.encodeFunctionData(
        "requestDeposit(uint256,address,address,address)",
        [amountInWei, address, address, address]
      ),
    };
    calls.push(requestDepositCall);

    /* const revokeOperatorCall = {
      target: vault.address,
      allowFailure: true,
      callData: vault.interface.encodeFunctionData("setOperator", [
        MULTICALL3_ADDRESS,
        false,
      ]),
    };
    calls.push(revokeOperatorCall); */

    try {
      // Pass ETH value if wrapping native token
      const value = wrapNativeToken ? amountInWei.toString() : undefined;
      const tx = await batchTxs(chainId, calls, value);
      return tx as unknown as TransactionResponse;
    } catch (error) {
      console.warn(
        "Batch transaction failed, falling back to sequential:",
        error
      );
      return await submitRequestDeposit(amount, wrapNativeToken);
    }
  };

  const submitRequestDepositOnSafe = async (
    amount: string,
    wrapNativeToken: boolean
  ) => {
    if (!address) throw new Error("No address found");
    if (!safeAddress || !isDeployed || isLoading)
      throw new Error("Safe not linked");

    if (wrapNativeToken) {
      // Wrap native token to WETH: must be triggered by user
      await wrapNativeETH(network.chainId!.toString(), amount);
    }

    await executeDepositRequestWorkflow(amount);
  };

  return {
    submitRequestDeposit,
    submitRequestDepositOnMulticall,
    submitRequestDepositOnSafe,
    cancelDepositRequest,
  };
}
