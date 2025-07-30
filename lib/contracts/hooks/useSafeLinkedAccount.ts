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
import { useEffect, useRef, useState } from "react";
import { parseUnits } from "viem";
//import { usePublicClient, useWalletClient } from "wagmi";
import { getContractNetworks } from "../utils/protocols/gnosis";
import {
  getPermit2ApproveTx,
  getPermit2TransferFromTx,
} from "../utils/protocols/permit2";
import { getApproveTx, getWrapNativeETHTx } from "../utils/TokenUtils";
import {
  getEthersProvider,
  getSignerAndContract,
  randomNonceInteger,
  toNonce,
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
  //const { data: walletClient } = useWalletClient();
  //const publicClient = usePublicClient();

  const [state, setState] = useState<SafeLinkedAccountState>({
    safeAddress: null,
    isDeployed: false,
    isLoading: false,
    error: null,
  });
  const [safeSDK, setSafeSDK] = useState<Safe | null>(null);

  const saltNonceRef = useRef<`0x${string}`>(toNonce(randomNonceInteger()));

  useEffect(() => {
    const isSafeInitialized = async () => {
      if (!address || !network.chainId || !safeSDK) return false;

      const currentSafeAddress = await safeSDK.getAddress();
      const isSameSafe =
        currentSafeAddress?.toLowerCase() === state.safeAddress?.toLowerCase();

      const isSameNetwork =
        String(await safeSDK.getChainId()) === network.chainId;

      const isSameSigner = await safeSDK.isOwner(address);

      return safeSDK && isSameSafe && isSameSigner && isSameNetwork;
    };

    const initializeSafe = async () => {
      try {
        setState((s) => ({ ...s, isLoading: true }));

        if (await isSafeInitialized()) {
          setState((s) => ({ ...s, isLoading: false }));
          return;
        }

        const predictedSafe: PredictedSafeProps = {
          safeAccountConfig: {
            owners: [address!],
            threshold: 1,
          },
          safeDeploymentConfig: {
            saltNonce: saltNonceRef.current,
            safeVersion: "1.4.1",
          },
        };

        const safeProvider = getEthersProvider() as unknown as Eip1193Provider;
        const signer = getEthersProvider().getSigner(address!);
        const safeSigner = (await signer.getAddress()).toString();

        const safeConfig: SafeConfigWithPredictedSafe = {
          provider: safeProvider,
          signer: safeSigner,
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
        setSafeSDK(null);
        setState({
          safeAddress: null,
          isDeployed: false,
          isLoading: false,
          error: error as Error,
        });
      }
    };

    if (address && network.chainId) initializeSafe();
  }, [address, network.chainId, safeSDK, state.safeAddress]);

  const executeSafeBatchWorkflow = async (
    txs: SafeTransactionDataPartial[]
  ) => {
    if (!safeSDK || !state.safeAddress)
      throw new Error("Safe or wallet not ready");

    if (!state.isDeployed) {
      const { underlyingToken } = await getSignerAndContract(
        network.chainId!.toString()
      );

      /* // Each transfer requires user to sign the Permit2 tx
      const permitTx = await getPermit2TransferTx({
        owner: address!,
        token,
        amount,
        deadline,
        to: safeAddress,
        publicClient: publicClient!,
        walletClient: walletClient!,
        chainId: network.chainId! as number,
      });
      if (permitTx) txs.push(permitTx); */

      // User's one time approval to Permit2 to transfer tokens from user to safe
      const permitApproveTx = getPermit2ApproveTx({
        token: underlyingToken.address,
        spender: state.safeAddress,
      });
      if (!permitApproveTx) throw new Error("Permit2 approve tx not found");
      txs = [permitApproveTx, ...txs];
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

    const signer = getEthersProvider().getSigner();
    const txResponse = await signer.sendTransaction(txsBatch);
    /* const txResponse = await signer.sendTransaction({
      to: deploymentTxs.to,
      data: deploymentTxs.data,
      value: deploymentTxs.value ?? 0,
    }); */

    await txResponse.wait();
  };

  const executeDepositRequestWorkflow = async (
    amount: string,
    wrapNativeToken: boolean
  ) => {
    if (!safeSDK || !state.safeAddress)
      throw new Error("Safe or wallet not ready");

    const txs: SafeTransactionDataPartial[] = [];
    const { underlyingToken, vault, tokenMetadata } =
      await getSignerAndContract(network.chainId!.toString());

    if (wrapNativeToken) {
      const wrapNativeETHTx = await getWrapNativeETHTx(
        network.chainId!.toString()
      );
      if (wrapNativeETHTx) {
        const wrapNativeETHTxCall = {
          to: wrapNativeETHTx.target,
          value: amount,
          data: wrapNativeETHTx.callData,
        };
        txs.push(wrapNativeETHTxCall);
      }
    }

    const amountInWei = parseUnits(amount, tokenMetadata.decimals);

    // Transfer tokens from user to safe using Permit2 if the one time approval is done
    const transferFromTx = getPermit2TransferFromTx({
      from: address!,
      to: state.safeAddress,
      amount: amountInWei,
      token: underlyingToken.address,
    });
    if (transferFromTx) txs.push(transferFromTx);

    // Approve tokens to be transferred from safe to the vault
    const approveTx = await getApproveTx(
      network.chainId!.toString(),
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

    await executeSafeBatchWorkflow(txs);
  };

  return {
    ...state,
    executeSafeBatchWorkflow,
    executeDepositRequestWorkflow,
  };
}
