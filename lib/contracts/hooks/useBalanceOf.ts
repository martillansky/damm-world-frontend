import { useSafeLinkedAccountContext } from "@/context/SafeLinkedAccountContext";
import { useAppKitNetwork } from "@reown/appkit/react";
import { formatUnits } from "ethers/lib/utils";
import { useAccount, usePublicClient } from "wagmi";
import { getEthersProvider, getSignerAndContract } from "../utils/utils";

export function useBalanceOf() {
  const { address } = useAccount();
  const network = useAppKitNetwork();
  const { safeAddress } = useSafeLinkedAccountContext();
  const publicClient = usePublicClient();

  const getUnderlyingTokenDecimals = async () => {
    const { tokenMetadata } = await getSignerAndContract(
      network.chainId?.toString() ?? ""
    );
    return tokenMetadata.decimals;
  };

  const getNativeBalance = async () => {
    if (!address) throw new Error("No address found");

    const balanceNative = await getEthersProvider().getBalance(address);
    return formatUnits(balanceNative, 18);
  };

  const getUnderlyingBalanceOf = async () => {
    if (!address) throw new Error("No address found");

    const { underlyingToken, tokenMetadata } = await getSignerAndContract(
      network.chainId?.toString() ?? ""
    );

    // These are the underlying tokens user has on his wallet
    const balance = await publicClient?.readContract({
      address: underlyingToken.address,
      abi: underlyingToken.interface.fragments,
      functionName: "balanceOf",
      args: [address],
    });

    return formatUnits(balance as bigint, tokenMetadata.decimals);
  };

  const getBalanceOf = async () => {
    if (!address) throw new Error("No address found");

    const { vault, tokenMetadata } = await getSignerAndContract(
      network.chainId?.toString() ?? ""
    );

    // These are the shares ready to be withdrawn (user holds them on his wallet)
    const balance = await publicClient?.readContract({
      address: vault.address,
      abi: vault.interface.fragments,
      functionName: "balanceOf",
      args: [address],
    });

    return formatUnits(balance as bigint, tokenMetadata.decimals);
  };

  const getBalanceFromSafe = async () => {
    if (!safeAddress) throw new Error("No address found");

    const { vault, tokenMetadata } = await getSignerAndContract(
      network.chainId?.toString() ?? ""
    );

    const balance = await publicClient?.readContract({
      address: vault.address,
      abi: vault.interface.fragments,
      functionName: "balanceOf",
      args: [safeAddress],
    });

    return formatUnits(balance as bigint, tokenMetadata.decimals);
  };

  const getSuppplyBalanceFromSafe = async () => {
    if (!address || !safeAddress) throw new Error("No address found");

    const { underlyingToken, tokenMetadata } = await getSignerAndContract(
      network.chainId?.toString() ?? ""
    );

    // Supply available to withdraw from safe
    const balance = await publicClient?.readContract({
      address: underlyingToken.address,
      abi: underlyingToken.interface.fragments,
      functionName: "balanceOf",
      args: [safeAddress],
    });

    return formatUnits(balance as bigint, tokenMetadata.decimals);
  };

  return {
    getUnderlyingBalanceOf,
    getNativeBalance,
    getBalanceOf,
    getUnderlyingTokenDecimals,
    getSuppplyBalanceFromSafe,
    getBalanceFromSafe,
  };
}
