import { useAppKitNetwork } from "@reown/appkit/react";
import { formatUnits } from "ethers/lib/utils";
import { useAccount } from "wagmi";
import { getSignerAndContract } from "../utils/utils";

export function useTVL() {
  const { address } = useAccount();
  const network = useAppKitNetwork();

  const getTVL = async () => {
    if (!address) throw new Error("No address found");

    const { vault } = await getSignerAndContract(
      network.chainId?.toString() ?? ""
    );

    const tvl = await vault.totalSupply();
    return formatUnits(tvl, 18);
  };

  return { getTVL };
}
