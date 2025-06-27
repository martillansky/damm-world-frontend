import { useAppKitNetwork } from "@reown/appkit/react";
import { formatUnits } from "ethers/lib/utils";
import { useAccount } from "wagmi";
import { getEthersProvider, getSignerAndContract } from "../utils/utils";

export function useBalanceOf() {
  const { address } = useAccount();
  const network = useAppKitNetwork();

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
    console.log("network: ", network);
    if (!address) throw new Error("No address found");

    const { underlyingToken, tokenMetadata } = await getSignerAndContract(
      network.chainId?.toString() ?? ""
    );

    console.log("underlyingToken: ", underlyingToken.address);
    console.log("NATIVE: ", await getNativeBalance());

    // These are the underlying tokens user has on his wallet
    const balance = await underlyingToken.balanceOf(address);

    console.log("balance: ", balance);

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

  return {
    getUnderlyingBalanceOf,
    getNativeBalance,
    getBalanceOf,
    getUnderlyingTokenDecimals,
  };
}
