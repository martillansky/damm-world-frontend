import { getTypedChainId } from "@/lib/utils/chain";
import { getEnvVars } from "@/lib/utils/env";
import { BigNumber, ethers } from "ethers";
import IERC20ABI from "../abis/IERC20.json";
import { Call } from "./BatchTxs";
import { getEthersProvider, getSignerAndContract } from "./utils";

const WETH_ABI = [
  "function deposit() payable",
  "function withdraw(uint256 wad)",
];

export async function getApproveTx(
  address: string,
  vaultAddress: string,
  underlyingTokenAddress: string,
  amountInWei: BigNumber
): Promise<Call | null> {
  const provider = getEthersProvider();
  const underlyingToken = new ethers.Contract(
    underlyingTokenAddress,
    IERC20ABI,
    provider
  );

  const allowance = await underlyingToken.allowance(address, vaultAddress);

  if (allowance.lt(amountInWei)) {
    // User needs to approve the vault to spend the underlying token
    const approveData = underlyingToken.interface.encodeFunctionData(
      "approve",
      [vaultAddress, amountInWei]
    );
    return {
      target: underlyingToken.address,
      allowFailure: false,
      callData: approveData,
    };
  }
  return null;
}

export async function handleApprove(
  address: string,
  vaultAddress: string,
  underlyingTokenAddress: string,
  amountInWei: BigNumber
) {
  const provider = getEthersProvider();
  const underlyingToken = new ethers.Contract(
    underlyingTokenAddress,
    IERC20ABI,
    provider
  );

  const allowance = await underlyingToken.allowance(address, vaultAddress);

  if (allowance.lt(amountInWei)) {
    // User needs to approve the vault to spend the underlying token
    const tx = await underlyingToken.approve(vaultAddress, amountInWei);
    await tx.wait();
  }
}

export async function wrapNativeETH(chainId: string, amountInETH: string) {
  const { UNDERLYING_TOKEN } = getEnvVars(getTypedChainId(Number(chainId)));
  const { signer } = await getSignerAndContract(chainId);

  const weth = new ethers.Contract(UNDERLYING_TOKEN, WETH_ABI, signer);
  const amount = ethers.utils.parseEther(amountInETH);

  const tx = await weth.deposit({ value: amount });
  console.log(`Wrapping ETH → WETH: tx hash ${tx.hash}`);
  await tx.wait();
  console.log(`Wrapped ${amountInETH} ETH into WETH.`);
}

export async function unwrapWETH(chainId: string, amountInWETH: string) {
  const { UNDERLYING_TOKEN } = getEnvVars(getTypedChainId(Number(chainId)));
  const { signer } = await getSignerAndContract(chainId);
  const weth = new ethers.Contract(UNDERLYING_TOKEN, WETH_ABI, signer);
  const amount = ethers.utils.parseEther(amountInWETH);

  const tx = await weth.withdraw(amount);
  console.log(`Unwrapping WETH → ETH: tx hash ${tx.hash}`);
  await tx.wait();
  console.log(`Unwrapped ${amountInWETH} WETH into ETH.`);
}

export async function getWrapNativeETHTx(chainId: string): Promise<Call> {
  const { UNDERLYING_TOKEN } = getEnvVars(getTypedChainId(Number(chainId)));
  const { signer } = await getSignerAndContract(chainId);

  const weth = new ethers.Contract(UNDERLYING_TOKEN, WETH_ABI, signer);

  return {
    target: weth.address,
    allowFailure: false,
    callData: weth.interface.encodeFunctionData("deposit"),
  };
}
