import { useAppKitNetwork } from "@reown/appkit/react";
import { formatUnits } from "ethers/lib/utils";
import { useAccount } from "wagmi";
import { getEthersProvider, getSignerAndContract } from "../utils/utils";

export function useBalanceOf() {
  const { address } = useAccount();
  const network = useAppKitNetwork();

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
    const balance = await underlyingToken.balanceOf(address);

    return formatUnits(balance, tokenMetadata.decimals);
  };

  const getBalanceOf = async () => {
    if (!address) throw new Error("No address found");

    const { vault } = await getSignerAndContract(
      network.chainId?.toString() ?? ""
    );

    // These are the shares ready to be withdrawn (user holds them on his wallet)
    const balance = await vault.balanceOf(address);

    return formatUnits(balance, 18);
  };

  return { getUnderlyingBalanceOf, getNativeBalance, getBalanceOf };
}
