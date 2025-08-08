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

  // Check if we have valid addresses
  const hasValidAddress =
    address && address.length > 0 && address.startsWith("0x");
  const hasValidSafeAddress =
    safeAddress && safeAddress.length > 0 && safeAddress.startsWith("0x");

  const getUnderlyingTokenDecimals = async () => {
    if (!hasValidAddress || !network.chainId) return 18; // Default to 18 decimals

    try {
      const { tokenMetadata } = await getSignerAndContract(
        network.chainId.toString()
      );
      return tokenMetadata.decimals;
    } catch (error) {
      console.warn("Failed to get token decimals:", error);
      return 18; // Default fallback
    }
  };

  const getNativeBalance = async () => {
    if (!hasValidAddress || !publicClient) return "0";

    try {
      const balanceNative = await getEthersProvider().getBalance(address);
      return formatUnits(balanceNative, 18);
    } catch (error) {
      console.warn("Failed to fetch native balance:", error);
      return "0";
    }
  };

  const getUnderlyingBalanceOf = async () => {
    if (!hasValidAddress || !publicClient || !network.chainId) return "0";

    try {
      const { underlyingToken, tokenMetadata } = await getSignerAndContract(
        network.chainId.toString()
      );

      // These are the underlying tokens user has on his wallet
      const balance = await publicClient.readContract({
        address: underlyingToken.address,
        abi: underlyingToken.interface.fragments,
        functionName: "balanceOf",
        args: [address],
      });

      return formatUnits(balance as bigint, tokenMetadata.decimals);
    } catch (error) {
      console.warn("Failed to fetch underlying balance:", error);
      return "0";
    }
  };

  const getBalanceOf = async () => {
    if (!address || !publicClient) return "0";

    try {
      const { vault, tokenMetadata } = await getSignerAndContract(
        network.chainId?.toString() ?? ""
      );

      // These are the shares ready to be withdrawn (user holds them on his wallet)
      const balance = await publicClient.readContract({
        address: vault.address,
        abi: vault.interface.fragments,
        functionName: "balanceOf",
        args: [address],
      });

      return formatUnits(balance as bigint, tokenMetadata.decimals);
    } catch (error) {
      console.warn("Failed to fetch balance:", error);
      return "0";
    }
  };

  const getBalanceFromSafe = async () => {
    if (!hasValidSafeAddress || !publicClient || !network.chainId) return "0";

    try {
      const { vault, tokenMetadata } = await getSignerAndContract(
        network.chainId.toString()
      );

      const balance = await publicClient.readContract({
        address: vault.address,
        abi: vault.interface.fragments,
        functionName: "balanceOf",
        args: [safeAddress],
      });

      return formatUnits(balance as bigint, tokenMetadata.decimals);
    } catch (error) {
      console.warn("Failed to fetch safe balance:", error);
      return "0";
    }
  };

  const getSuppplyBalanceFromSafe = async () => {
    if (
      !hasValidAddress ||
      !hasValidSafeAddress ||
      !publicClient ||
      !network.chainId
    )
      return "0";

    try {
      const { underlyingToken, tokenMetadata } = await getSignerAndContract(
        network.chainId.toString()
      );

      // Supply available to withdraw from safe
      const balance = await publicClient.readContract({
        address: underlyingToken.address,
        abi: underlyingToken.interface.fragments,
        functionName: "balanceOf",
        args: [safeAddress],
      });

      return formatUnits(balance as bigint, tokenMetadata.decimals);
    } catch (error) {
      console.warn("Failed to fetch supply balance from safe:", error);
      return "0";
    }
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
