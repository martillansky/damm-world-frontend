import { SupportedChainId, supportedChainsObject } from "../reown";

export function getTypedChainId(chainId?: number): SupportedChainId {
  if (!chainId) throw new Error("Missing chain ID");

  if (
    !Object.values(supportedChainsObject).some((chain) => chain.id === chainId)
  ) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  return chainId as SupportedChainId;
}
