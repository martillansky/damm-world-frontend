import { TransactionResponse } from "@ethersproject/providers";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import Safe, {
  Eip1193Provider,
  PredictedSafeProps,
  SafeConfig,
} from "@safe-global/protocol-kit";
import {
  SafeTransaction,
  SafeTransactionDataPartial,
  Transaction,
} from "@safe-global/types-kit";
import { BigNumber } from "ethers";
import { useEffect, useState } from "react";
import {
  Chain,
  createWalletClient,
  custom,
  parseUnits,
  publicActions,
  WalletClient,
} from "viem";
import { parseAccount } from "viem/accounts";
import { usePublicClient, useWalletClient } from "wagmi";
import { getContractNetworks } from "../utils/protocols/gnosis";
import {
  getPermit2ApproveTx,
  getPermit2TransferFromTx,
  isPermit2Approved,
  MAX_UINT160,
  PERMIT2_ADDRESS,
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
  const chain = walletClient?.chain as Chain;
  const publicClient = usePublicClient();

  const [state, setState] = useState<SafeLinkedAccountState>({
    safeAddress: null,
    isDeployed: false,
    isLoading: false,
    error: null,
  });
  const [safeSDK, setSafeSDK] = useState<Safe | null>(null);
  const [client, setClient] = useState<WalletClient | null>(null);

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
        const safeProvider = walletClient.transport as Eip1193Provider;

        const client = createWalletClient({
          account: parseAccount(address!),
          chain,
          transport: custom(safeProvider),
        });

        const contractNetworks = getContractNetworks({
          version: "1.4.1",
          released: true,
          network: network.chainId!.toString(),
        });

        const safeConfig: SafeConfig = {
          provider: client.transport,
          signer: address,
          predictedSafe,
          contractNetworks: contractNetworks,
          isL1SafeSingleton: true,
        };

        let sdk = await Safe.init(safeConfig);

        const safeAddress = await sdk.getAddress();
        console.log("SAFE ADDRESS", safeAddress);
        const isDeployed = await sdk.isSafeDeployed();
        console.log("IS DEPLOYED", isDeployed);
        const contractVersion = sdk.getContractVersion();
        console.log("CONTRACT VERSION", contractVersion);

        if (isDeployed) {
          const safeConfig: SafeConfig = {
            provider: client.transport,
            signer: address,
            safeAddress: safeAddress,
            contractNetworks: contractNetworks,
          };
          sdk = await Safe.init(safeConfig);
          sdk = await sdk.connect({
            signer: address,
            safeAddress: safeAddress,
          });
        }

        setSafeSDK(sdk);

        setClient(client);
        setState({
          safeAddress,
          isDeployed,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.log("ERROR INITIALIZING SAFE", error);
        setSafeSDK(null);
        setClient(null);
        setState({
          safeAddress: null,
          isDeployed: false,
          isLoading: false,
          error: error as Error,
        });
      }
    };

    if (address && network.chainId && walletClient) initializeSafe();
  }, [address, network.chainId, walletClient]);

  const executeSafeBatchWorkflow = async (
    txs: SafeTransactionDataPartial[]
  ) => {
    if (!safeSDK || !state.safeAddress || !client)
      throw new Error("Safe not ready");
    if (!address || !network.chainId) throw new Error("Failed connection");

    const signer = getEthersProvider().getSigner();

    if (!state.isDeployed) {
      const chainId = network.chainId.toString();
      const { underlyingToken } = await getSignerAndContract(chainId);

      // Approve underlying token to transfer on Permit2
      const approveTx = await getApproveTx(
        chainId,
        address,
        PERMIT2_ADDRESS,
        BigNumber.from(MAX_UINT160)
      );
      if (approveTx) {
        const txResponse = await signer.sendTransaction({
          to: approveTx.target,
          value: "0",
          data: approveTx.callData,
        });
        await txResponse.wait();
      }
      const isPermit2ApprovalRequired = !(await isPermit2Approved({
        token: underlyingToken.address,
        owner: address,
        spender: state.safeAddress,
        publicClient: publicClient!,
      }));

      if (isPermit2ApprovalRequired) {
        // User's one time approval to Permit2 to transfer tokens from user to safe
        const permitApproveTx = getPermit2ApproveTx({
          token: underlyingToken.address,
          spender: state.safeAddress,
        });
        if (!permitApproveTx) throw new Error("Permit2 approve tx not found");

        const txResponse = await signer.sendTransaction(permitApproveTx);
        await txResponse.wait();
      }
    }

    const safeTx: SafeTransaction = await safeSDK.createTransaction({
      transactions: txs,
      onlyCalls: true,
    });

    if (state.isDeployed) {
      const txResponse = await safeSDK.executeTransaction(safeTx);
      return {
        hash: txResponse.hash,
        wait: () =>
          client.extend(publicActions).waitForTransactionReceipt({
            hash: txResponse.hash as `0x${string}`,
          }),
      };
    }

    const signedSafeTx: SafeTransaction = await safeSDK.signTransaction(safeTx);
    const deploymentBatch: Transaction =
      await safeSDK.wrapSafeTransactionIntoDeploymentBatch(signedSafeTx);

    const params = {
      to: deploymentBatch.to as `0x${string}`,
      value: BigInt(deploymentBatch.value),
      data: deploymentBatch.data as `0x${string}`,
      chain: client.chain as Chain,
      account: address as `0x${string}`,
    };

    const request = await client.prepareTransactionRequest(params);
    const txHash = await client.sendTransaction({
      account: address as `0x${string}`,
      ...request,
    });

    return {
      hash: txHash,
      wait: () =>
        client
          .extend(publicActions)
          .waitForTransactionReceipt({ hash: txHash }),
    };
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

    //const txResponse = await deploySafeOnly();
    const txResponse = await executeSafeBatchWorkflow(txs);
    return txResponse as unknown as TransactionResponse;
  };

  const deploySafeOnly = async () => {
    if (!safeSDK || !client) throw new Error("Safe not ready");
    if (!address || !chain) throw new Error("Failed connection");

    const tx = await safeSDK.createSafeDeploymentTransaction();
    const txResponse = await client.sendTransaction({
      account: address as `0x${string}`,
      to: tx.to as `0x${string}`,
      value: BigInt(tx.value),
      data: tx.data as `0x${string}`,
      chain,
    });
    return txResponse as unknown as TransactionResponse;
  };

  return {
    ...state,
    executeSafeBatchWorkflow,
    executeDepositRequestWorkflow,
    deploySafeOnly,
  };
}
