import {
  IERC20__factory,
  MockToken__factory,
  Vault__factory,
  VaultForked__factory,
} from "@/lib/contracts/types";
import { getTypedChainId } from "@/lib/utils/chain";
import { getEnvVars } from "@/lib/utils/env";
import { TransactionResponse } from "@ethersproject/providers";
import { ethers, Signer } from "ethers";
import { keccak256, toBytes } from "viem";
import { getTokenMetadata, TokenMetadata } from "./TokenMetadata";

/* export function toBytes(hex: string): string {
  return hex.startsWith("0x") ? hex : `0x${hex}`;
} */

export async function getSignerAndContract(chainId: string) {
  const signer: Signer = await getSigner();
  if (!signer) throw new Error("Signer not found");
  const typedChain = getTypedChainId(Number(chainId));
  const { VAULT_ADDRESS, UNDERLYING_TOKEN, ANVIL_FORKED } =
    getEnvVars(typedChain);

  let vault;
  let underlyingToken;
  if (typedChain === 31337 && !ANVIL_FORKED) {
    vault = Vault__factory.connect(VAULT_ADDRESS!, signer);
    underlyingToken = MockToken__factory.connect(UNDERLYING_TOKEN!, signer);
  } else {
    vault = VaultForked__factory.connect(VAULT_ADDRESS!, signer);
    underlyingToken = IERC20__factory.connect(UNDERLYING_TOKEN!, signer);
  }

  // Get provider and token metadata
  const provider = getEthersProvider();
  const tokenMetadata: TokenMetadata = await getTokenMetadata(
    UNDERLYING_TOKEN!,
    provider as ethers.providers.Web3Provider
  );

  return {
    signer,
    vault,
    underlyingToken,
    tokenMetadata,
  };
}

export const getSigner = async (): Promise<Signer> => {
  const provider = getEthersProvider();
  await provider.send("eth_requestAccounts", []); // request connection
  return provider.getSigner();
};

export async function getTransactionReceipt(
  signer: Signer,
  tx: TransactionResponse
) {
  // Wait for transaction confirmation using the provider
  if (!signer.provider) {
    throw new Error("Signer has no provider");
  }

  // Use type assertion to access the hash property
  const txResponse = tx as unknown as TransactionResponse;
  const receipt = await signer.provider.waitForTransaction(txResponse.hash);
  return receipt;
}

export function getEthersProvider(): ethers.providers.Web3Provider {
  if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
    return new ethers.providers.Web3Provider(window.ethereum);
  } else {
    throw new Error("No injected provider found (e.g., MetaMask).");
  }
}

export function toNonce(number: number): `0x${string}` {
  return keccak256(toBytes(number.toString())) as `0x${string}`;
}

export function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomNonceInteger() {
  return randomInteger(0, 100000000 * 100000000);
}
