import { useAppKitNetwork } from "@reown/appkit/react";
import { formatUnits } from "ethers/lib/utils";
import { useAccount } from "wagmi";
import { getSignerAndContract } from "../utils/utils";

export function useRedeemableAssets() {
  const { address } = useAccount();
  const network = useAppKitNetwork();

  const getRedeemableAssets = async () => {
    if (!address) throw new Error("No address found");

    const { vault } = await getSignerAndContract(
      network.chainId?.toString() ?? ""
    );

    // These are the assets ready to be redeemed
    const redeemableAssets = await vault.pendingRedeemRequest(0, address);
    //const redeemableAssets = await vault.claimableRedeemRequest(0, address);
    //const redeemableAssets = await vault.maxRedeem(address);

    console.log("REDEEMABLE ASSETS: ", redeemableAssets);

    return formatUnits(redeemableAssets, 18);
  };

  return { getRedeemableAssets };
}
