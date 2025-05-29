const CHAINS = [31337, 84532] as const;
export type SupportedChainId = (typeof CHAINS)[number];

export function getTypedChainId(chainId?: number): SupportedChainId {
  if (!chainId) throw new Error("Missing chain ID");

  if (!CHAINS.includes(chainId as SupportedChainId)) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  return chainId as SupportedChainId;
}
