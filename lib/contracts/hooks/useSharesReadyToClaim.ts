import { useAppKitNetwork } from "@reown/appkit/react";
import { formatUnits } from "ethers/lib/utils";
import { useAccount } from "wagmi";
import { getSignerAndContract } from "../utils/utils";

export function useSharesReadyToClaim() {
  const { address } = useAccount();
  const network = useAppKitNetwork();

  const getSharesReadyToClaim = async () => {
    if (!address) throw new Error("No address found");

    const { vault } = await getSignerAndContract(
      network.chainId?.toString() ?? ""
    );

    // These are the shares ready to be claimed
    const sharesReady = await vault.maxMint(address);
    return formatUnits(sharesReady, 18);
  };

  return { getSharesReadyToClaim };
}
