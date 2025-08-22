import { useVaults } from "@/context/VaultContext";
import { getTypedChainId } from "@/lib/utils/chain";
import { getEnvVars } from "@/lib/utils/env";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useQuery } from "@tanstack/react-query";
import { Abi, Address, formatUnits, MulticallParameters } from "viem";
import { usePublicClient } from "wagmi";
import IERC20ABI from "../abis/IERC20.json";
import { getEthersProvider } from "../utils/utils";

export interface WalletBalances {
  nativeBalance: string;
  vaultTokenBalances: {
    [vaultId: string]: {
      balance: string;
    };
  };
}

export function useWalletBalances() {
  const { address } = useAppKitAccount();
  const network = useAppKitNetwork();
  const publicClient = usePublicClient();
  const { vaults } = useVaults();

  const { IS_UNDERLYING_WRAP_NATIVE: isUnderlyingWrapNative } = getEnvVars(
    getTypedChainId(Number(network.chainId))
  );

  return useQuery<WalletBalances>({
    queryKey: ["walletBalances", address, network.chainId],
    queryFn: async () => {
      if (!address || !network.chainId || !publicClient || !vaults) {
        throw new Error("Missing required data for safe balances");
      }

      try {
        const result: WalletBalances = {
          nativeBalance: "",
          vaultTokenBalances: {},
        };

        if (isUnderlyingWrapNative) {
          const balanceNative = await getEthersProvider().getBalance(address);
          result.nativeBalance = formatUnits(balanceNative.toBigInt(), 18);
        }

        const contracts: MulticallParameters["contracts"] =
          vaults.vaultsData.flatMap((vault) => [
            {
              address: vault.staticData.token_address as Address,
              abi: IERC20ABI as Abi,
              functionName: "balanceOf",
              args: [address as Address],
            },
          ]);

        const results = await publicClient.multicall({
          contracts,
          allowFailure: false,
        });

        vaults.vaultsData.forEach((v, i) => {
          const availableSupply = results[i] as bigint;
          const dec = v.staticData.token_decimals;
          result.vaultTokenBalances[v.staticData.vault_id.toString()] = {
            balance: formatUnits(availableSupply, dec),
          };
        });

        return result;
      } catch (error) {
        console.error("Error fetching safe balances:", error);
        return {
          nativeBalance: "",
          vaultTokenBalances: {},
        };
      }
    },
    enabled:
      !!address &&
      !!network.chainId &&
      !!publicClient &&
      address.length > 0 &&
      address.startsWith("0x") &&
      (address ? address.length > 0 && address.startsWith("0x") : true) &&
      localStorage.getItem("disconnect_requested") !== "true", // Don't poll if disconnect was requested
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: true,
  });
}
