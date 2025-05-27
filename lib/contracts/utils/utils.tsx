import {
  IERC20__factory,
  //MockToken__factory,
  Vault__factory,
  VaultForked__factory,
} from "@/lib/contracts/types";
import { anvil } from "@/lib/reown/chains";
import { TransactionResponse } from "@ethersproject/providers";
import { ethers, Signer } from "ethers";

export function getVaultAddress(chainId: string): string {
  if (chainId === anvil.id.toString()) {
    //return process.env.NEXT_PUBLIC_VAULT_ADDRESS!; // ANVIL
    return process.env.NEXT_PUBLIC_FORKED_VAULT_ADDRESS_WC!; // FORKED WORLDCHAIN
  }
  return process.env.NEXT_PUBLIC_BASE_SEPOLIA_VAULT_ADDRESS!;
}

export function getUnderlyingTokenAddress(chainId: string): string {
  if (chainId === anvil.id.toString()) {
    //return process.env.NEXT_PUBLIC_ANVIL_UNDERLYING_TOKEN!; // ANVIL
    return process.env.NEXT_PUBLIC_FORKED_UNDERLYING_TOKEN_ADDRESS_WC!; // FORKED WORLDCHAIN
  }
  return process.env.NEXT_PUBLIC_BASE_SEPOLIA_UNDERLYING_TOKEN!;
}

export function toBytes(hex: string): string {
  return hex.startsWith("0x") ? hex : `0x${hex}`;
}

export async function getSignerAndContract(chainId: string) {
  const signer: Signer = getSigner();
  if (!signer) throw new Error("Signer not found");

  let vault;
  if (chainId === anvil.id.toString()) {
    console.log("CHAIN: ANVIL");
    vault = VaultForked__factory.connect(getVaultAddress(chainId), signer);
  } else {
    vault = Vault__factory.connect(getVaultAddress(chainId), signer);
  }
  /* const underlyingToken = MockToken__factory.connect(
    getUnderlyingTokenAddress(chainId),
    signer
  ); */

  const underlyingToken = IERC20__factory.connect(
    getUnderlyingTokenAddress(chainId),
    signer
  );

  return {
    signer,
    vault,
    underlyingToken,
  };
}

export const getSigner = () => {
  const provider = getEthersProvider();
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
    console.log("CHAIN ID: ", window.ethereum.chainId);

    return new ethers.providers.Web3Provider(window.ethereum);
  } else {
    throw new Error("No injected provider found (e.g., MetaMask).");
  }
}
