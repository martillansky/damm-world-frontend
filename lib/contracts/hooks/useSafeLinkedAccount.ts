import { TransactionResponse } from "@ethersproject/providers";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import Safe, {
  Eip1193Provider,
  PredictedSafeProps,
  SafeConfigWithPredictedSafe,
} from "@safe-global/protocol-kit";
import {
  SafeTransaction,
  SafeTransactionDataPartial,
  Transaction,
} from "@safe-global/types-kit";
import { BigNumber } from "ethers";
import { useEffect, useState } from "react";
import { parseUnits } from "viem";
import { useWalletClient } from "wagmi";
import { getContractNetworks } from "../utils/protocols/gnosis";
import {
  getPermit2ApproveTx,
  getPermit2TransferFromTx,
} from "../utils/protocols/permit2";
import { getApproveTx } from "../utils/TokenUtils";
import {
  getDeterministicSaltNonce,
  getEthersProvider,
  getSignerAndContract,
} from "../utils/utils";

interface SafeLinkedAccountState {
  safeAddress: string | null;
  isDeployed: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function useSafeLinkedAccount() {
  const network = useAppKitNetwork();
  const account = useAppKitAccount();
  const address = account?.address;
  const { data: walletClient } = useWalletClient();

  const [state, setState] = useState<SafeLinkedAccountState>({
    safeAddress: null,
    isDeployed: false,
    isLoading: false,
    error: null,
  });
  const [safeSDK, setSafeSDK] = useState<Safe | null>(null);

  useEffect(() => {
    const isSafeInitialized = async () => {
      if (!address || !network.chainId || !safeSDK) return false;

      const isSameNetwork =
        String(await safeSDK.getChainId()) === network.chainId;

      const isSameSigner = await safeSDK.isOwner(address);

      return isSameSigner && isSameNetwork;
    };

    const initializeSafe = async () => {
      try {
        setState((s) => ({ ...s, isLoading: true }));

        if (await isSafeInitialized()) {
          setState((s) => ({ ...s, isLoading: false }));
          return;
        }

        const saltNonce = getDeterministicSaltNonce(address!);

        const predictedSafe: PredictedSafeProps = {
          safeAccountConfig: {
            owners: [address!],
            threshold: 1,
          },
          safeDeploymentConfig: {
            saltNonce: saltNonce,
            safeVersion: "1.4.1",
          },
        };

        if (!walletClient) {
          throw new Error("Wallet client not available");
        }

        const safeProvider = walletClient as unknown as Eip1193Provider;

        const signer = walletClient.account?.address;
        if (!signer) {
          throw new Error("Signer address not available");
        }

        const safeConfig: SafeConfigWithPredictedSafe = {
          provider: safeProvider,
          signer,
          predictedSafe,
          contractNetworks: getContractNetworks({
            network: network.chainId!.toString(),
          }),
          isL1SafeSingleton: true,
        };

        const sdk = await Safe.init(safeConfig);
        const safeAddress = await sdk.getAddress();
        const isDeployed = await sdk.isSafeDeployed();

        setSafeSDK(sdk);
        setState({
          safeAddress,
          isDeployed,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.log("ERROR INITIALIZING SAFE", error);
        setSafeSDK(null);
        setState({
          safeAddress: null,
          isDeployed: false,
          isLoading: false,
          error: error as Error,
        });
      }
    };

    if (address && network.chainId && walletClient) initializeSafe();
  }, [address, network.chainId, walletClient, safeSDK]);

  const executeSafeBatchWorkflow = async (
    txs: SafeTransactionDataPartial[]
  ) => {
    if (!safeSDK || !state.safeAddress) throw new Error("Safe not ready");
    if (!address || !network.chainId) throw new Error("Failed connection");

    const signer = getEthersProvider().getSigner();

    if (!state.isDeployed) {
      const chainId = network.chainId.toString();
      const { underlyingToken } = await getSignerAndContract(chainId);

      // User's one time approval to Permit2 to transfer tokens from user to safe
      const permitApproveTx = getPermit2ApproveTx({
        token: underlyingToken.address,
        spender: state.safeAddress,
      });
      if (!permitApproveTx) throw new Error("Permit2 approve tx not found");

      const txResponse = await signer.sendTransaction(permitApproveTx);
      await txResponse.wait();
    }

    const safeTx = await safeSDK.createTransaction({
      transactions: txs,
      onlyCalls: true,
    });

    const signedSafeTx: SafeTransaction = await safeSDK.signTransaction(safeTx);
    let txsBatch: Transaction;
    if (!state.isDeployed) {
      txsBatch = await safeSDK.wrapSafeTransactionIntoDeploymentBatch(
        signedSafeTx
      );
    } else {
      txsBatch = signedSafeTx as unknown as Transaction;
    }

    const txResponse = await signer.sendTransaction(txsBatch);
    return txResponse as unknown as TransactionResponse;
  };

  const executeDepositRequestWorkflow = async (amount: string) => {
    if (!safeSDK || !state.safeAddress) throw new Error("Safe not ready");
    if (!address || !network.chainId) throw new Error("Failed connection");

    const txs: SafeTransactionDataPartial[] = [];
    const chainId = network.chainId.toString();
    const { underlyingToken, vault, tokenMetadata } =
      await getSignerAndContract(chainId);

    const amountInWei = parseUnits(amount, tokenMetadata.decimals);

    // Transfer tokens from user to safe using Permit2 if the one time approval is done
    const transferFromTx = getPermit2TransferFromTx({
      from: address,
      to: state.safeAddress,
      amount: amountInWei,
      token: underlyingToken.address,
    });
    if (transferFromTx) txs.push(transferFromTx);

    // Approve tokens to be transferred from safe to the vault
    const approveTx = await getApproveTx(
      chainId,
      state.safeAddress,
      vault.address,
      BigNumber.from(amountInWei)
    );
    if (approveTx) {
      txs.push({
        to: approveTx.target,
        value: "0",
        data: approveTx.callData,
      });
    }

    // Request deposit
    const requestDepositCall = {
      to: vault.address,
      value: "0",
      data: vault.interface.encodeFunctionData(
        "requestDeposit(uint256,address,address,address)",
        [amountInWei, state.safeAddress, state.safeAddress, state.safeAddress]
      ),
    };
    txs.push(requestDepositCall);

    const txResponse = await executeSafeBatchWorkflow(txs);
    return txResponse as unknown as TransactionResponse;
  };

  return {
    ...state,
    executeSafeBatchWorkflow,
    executeDepositRequestWorkflow,
  };
}
