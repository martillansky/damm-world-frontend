import { ethers } from "ethers";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
}

/**
 * Fetch token metadata (name, symbol, decimals) with fallbacks for non-standard ERC-20s
 */
export async function getTokenMetadata(
  tokenAddress: string,
  provider: ethers.providers.Web3Provider
): Promise<TokenMetadata> {
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

  let name = "Unknown";
  let symbol = "UNK";
  let decimals = 18;

  try {
    name = await contract.name();
  } catch {}

  try {
    symbol = await contract.symbol();
  } catch {}

  try {
    decimals = await contract.decimals();
  } catch {}

  return { name, symbol, decimals };
}
