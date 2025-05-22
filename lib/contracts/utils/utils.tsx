import {
  MockToken__factory,
  Silo__factory,
  Vault__factory,
} from "@/lib/contracts/types";
import { anvil } from "@/lib/reown/chains";
import { TransactionResponse, Web3Provider } from "@ethersproject/providers";
import { Signer } from "ethers";

export function getSiloAddress(): string {
  return process.env.NEXT_PUBLIC_SILO_ADDRESS!;
}

export function getVaultAddress(): string {
  return process.env.NEXT_PUBLIC_VAULT_ADDRESS!;
}

export function getUnderlyingTokenAddress(chainId: string): string {
  if (chainId === anvil.id.toString()) {
    return process.env.NEXT_PUBLIC_ANVIL_UNDERLYING_TOKEN!;
  }
  return process.env.NEXT_PUBLIC_BASE_SEPOLIA_UNDERLYING_TOKEN!;
}

export function toBytes(hex: string): string {
  return hex.startsWith("0x") ? hex : `0x${hex}`;
}

export async function getSignerAndContract(address: string, chainId: string) {
  if (!address) throw new Error("Wallet not connected");

  const signer: Signer | null = getSigner(address);

  if (!signer) throw new Error("Signer not found");

  const vault = Vault__factory.connect(getVaultAddress(), signer);
  const silo = Silo__factory.connect(getSiloAddress(), signer);
  const underlyingToken = MockToken__factory.connect(
    getUnderlyingTokenAddress(chainId),
    signer
  );

  return {
    signer,
    vault,
    silo,
    underlyingToken,
  };
}

export const getSigner = (address: string) => {
  const provider = getEthersProvider();
  return provider.getSigner(address);
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

export function getEthersProvider(): Web3Provider {
  if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
    return new Web3Provider(window.ethereum);
  } else {
    throw new Error("No injected provider found (e.g., MetaMask).");
  }
}
