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
} from "@safe-global/types-kit";
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
import {
  getERC20ApproveTx,
  getERC20TransferFromTx,
  getERC20TransferTx,
  isERC20Approved,
} from "../utils/protocols/eip2612";
import { getContractNetworks } from "../utils/protocols/gnosis";
import { getDeterministicSaltNonce, getEthersProvider } from "../utils/utils";

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

  // Use React Query for balance polling
  const isSafeInitialized = async () => {
    if (!address || !network.chainId || !safeSDK) return false;

    const isSameNetwork =
      String(await safeSDK.getChainId()) === network.chainId;

    const isSameSigner = await safeSDK.isOwner(address);

    return isSameSigner && isSameNetwork;
  };

  const initializeSafe = async (forceReinitialize = false) => {
    try {
      setState((s) => ({ ...s, isLoading: true }));

      if (!forceReinitialize && (await isSafeInitialized())) {
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

  useEffect(() => {
    if (address && network.chainId && walletClient) initializeSafe();
  }, [address, network.chainId, walletClient]);

  const executeFundSmartAccountWorkflow = async (
    tokenAddress: string,
    tokenDecimals: number,
    amount: string
  ) => {
    if (!safeSDK || !state.safeAddress || !client)
      throw new Error("Safe not ready");
    if (!address || !network.chainId) throw new Error("Failed connection");

    const txs: SafeTransactionDataPartial[] = [];

    const amountInWei = parseUnits(amount, tokenDecimals);

    await executeApproveSafeSpender(tokenAddress, amountInWei);

    // Transfer tokens from user to safe if the one time approval is done
    const transferFromTx = getERC20TransferFromTx({
      from: address,
      to: state.safeAddress,
      amount: amountInWei,
      token: tokenAddress,
    });
    if (transferFromTx) txs.push(transferFromTx);

    try {
      const txResponse = await executeSafeTransaction(txs);
      return txResponse as unknown as TransactionResponse;
    } catch (error) {
      console.error("Error executing safe transaction:", error);
      throw new Error("Cannot execute fund smart account workflow");
    }
  };

  const executeSafeTransaction = async (txs: SafeTransactionDataPartial[]) => {
    if (!safeSDK || !state.safeAddress || !client)
      throw new Error("Safe not ready");
    if (!address || !network.chainId) throw new Error("Failed connection");

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
    } else {
      throw new Error("Cannot execute safe transaction");
    }
  };

  const executeApproveSafeSpender = async (
    tokenAddress: string,
    amount?: bigint
  ) => {
    if (!safeSDK || !state.safeAddress || !client)
      throw new Error("Safe not ready");
    if (!address || !network.chainId) throw new Error("Failed connection");

    const signer = getEthersProvider().getSigner();

    // Allows to update user's allowance on token contract to transfer tokens from user to safe
    const isERC20ApprovalRequired = !(await isERC20Approved({
      token: tokenAddress,
      owner: address,
      spender: state.safeAddress,
      publicClient: publicClient!,
      amount: amount,
    }));

    if (isERC20ApprovalRequired) {
      const erc20ApproveTx = getERC20ApproveTx({
        token: tokenAddress,
        spender: state.safeAddress,
      });
      if (!erc20ApproveTx) throw new Error("ERC20 approve tx not found");

      const txResponse = await signer.sendTransaction(erc20ApproveTx);
      await txResponse.wait();
    }
  };

  const deploySafeAsSpender = async () => {
    if (!safeSDK || !client) throw new Error("Safe not ready");
    if (!address || !chain) throw new Error("Failed connection");

    // We would need to approve for each underlying token, it is better to do it in each fund workflow
    //await executeApproveSafeSpender();

    const tx = await safeSDK.createSafeDeploymentTransaction();
    const txHash = await client.sendTransaction({
      account: address as `0x${string}`,
      to: tx.to as `0x${string}`,
      value: BigInt(tx.value),
      data: tx.data as `0x${string}`,
      chain,
    });
    // Wait for deployment and refresh balances
    const receipt = await client
      .extend(publicActions)
      .waitForTransactionReceipt({ hash: txHash });

    // Re-initialize SafeSDK after deployment
    await initializeSafe(true);

    return {
      hash: txHash,
      wait: () => Promise.resolve(receipt),
    };
  };

  const executeExitWorkflow = async (
    tokenAddress: string,
    tokenDecimals: number,
    amount: string
  ) => {
    if (!safeSDK || !state.safeAddress || !client)
      throw new Error("Safe not ready");
    if (!address || !network.chainId) throw new Error("Failed connection");

    const txs: SafeTransactionDataPartial[] = [];
    const amountInWei = parseUnits(amount, tokenDecimals);

    // Transfer amountInWei from safe to user
    const transferFromTx = getERC20TransferTx({
      to: address,
      amount: amountInWei,
      token: tokenAddress,
    });
    if (transferFromTx) txs.push(transferFromTx);

    try {
      const txResponse = await executeSafeTransaction(txs);
      return txResponse as unknown as TransactionResponse;
    } catch (error) {
      console.error("Error executing safe transaction:", error);
      throw new Error("Safe not deployed, cannot execute exit workflow");
    }
  };

  return {
    ...state,
    executeFundSmartAccountWorkflow,
    deploySafeAsSpender,
    executeSafeTransaction,
    executeExitWorkflow,
  };
}
