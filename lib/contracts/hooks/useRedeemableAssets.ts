import { useAppKitNetwork } from "@reown/appkit/react";
import { formatUnits } from "ethers/lib/utils";
import { useAccount } from "wagmi";
import { getSignerAndContract } from "../utils/utils";

export function useRedeemableAssets() {
  const { address } = useAccount();
  const network = useAppKitNetwork();

  const getPendingRedeemableAssets = async () => {
    if (!address) throw new Error("No address found");

    const { vault } = await getSignerAndContract(
      network.chainId?.toString() ?? ""
    );

    // These are the assets waiting to be settled for being redeemed
    const pending = await vault.pendingRedeemRequest(0, address);
    return formatUnits(pending, 18);
  };

  const getRedeemableAssets = async () => {
    if (!address) throw new Error("No address found");

    const { vault } = await getSignerAndContract(
      network.chainId?.toString() ?? ""
    );

    // These are the assets ready to be redeemed
    const claimable = await vault.claimableRedeemRequest(0, address);
    return formatUnits(claimable, 18);
  };

  return { getRedeemableAssets, getPendingRedeemableAssets };
}
