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

  const getBalanceOf = async () => {
    if (!address) throw new Error("No address found");

    const { underlyingToken } = await getSignerAndContract(
      address,
      network.chainId?.toString() ?? ""
    );

    const balance = await underlyingToken.balanceOf(address);

    return formatUnits(balance, 18);
  };

  return { getBalanceOf, getNativeBalance };
}
