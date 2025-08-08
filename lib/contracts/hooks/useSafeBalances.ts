import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useQuery } from "@tanstack/react-query";
import { formatUnits } from "viem";
import { usePublicClient } from "wagmi";
import { getSignerAndContract } from "../utils/utils";

interface SafeBalances {
  availableSupply: string;
  shares: string;
}

export function useSafeBalances(safeAddress?: string) {
  const { address } = useAppKitAccount();
  const network = useAppKitNetwork();
  const publicClient = usePublicClient();

  return useQuery<SafeBalances>({
    queryKey: ["safeBalances", safeAddress || address, network.chainId],
    queryFn: async () => {
      if (!address || !network.chainId || !publicClient) {
        throw new Error("Missing required data for safe balances");
      }

      try {
        const { underlyingToken, vault, tokenMetadata } =
          await getSignerAndContract(network.chainId.toString());

        // Use the provided safe address or fall back to user address
        const targetAddress = safeAddress || address;

        const [availableSupply, shares] = await Promise.all([
          publicClient.readContract({
            address: underlyingToken.address as `0x${string}`,
            abi: underlyingToken.interface.fragments,
            functionName: "balanceOf",
            args: [targetAddress as `0x${string}`],
          }),
          publicClient.readContract({
            address: vault.address as `0x${string}`,
            abi: vault.interface.fragments,
            functionName: "balanceOf",
            args: [targetAddress as `0x${string}`],
          }),
        ]);

        const result = {
          availableSupply: formatUnits(
            availableSupply as bigint,
            tokenMetadata.decimals
          ),
          shares: formatUnits(shares as bigint, tokenMetadata.decimals),
        };

        return result;
      } catch (error) {
        console.error("Error fetching safe balances:", error);
        return {
          availableSupply: "0",
          shares: "0",
        };
      }
    },
    enabled:
      !!address &&
      !!network.chainId &&
      !!publicClient &&
      address.length > 0 &&
      address.startsWith("0x") &&
      (safeAddress
        ? safeAddress.length > 0 && safeAddress.startsWith("0x")
        : true) &&
      localStorage.getItem("disconnect_requested") !== "true", // Don't poll if disconnect was requested
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: true,
  });
}
