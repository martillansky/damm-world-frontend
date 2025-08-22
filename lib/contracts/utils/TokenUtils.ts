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

export async function wrapNativeETH(
  underlyingTokenAddress: string,
  chainId: string,
  amountInETH: string
) {
  const { signer } = await getSignerAndContract(chainId);

  const weth = new ethers.Contract(underlyingTokenAddress, WETH_ABI, signer);
  const amount = ethers.utils.parseEther(amountInETH);

  const tx = await weth.deposit({ value: amount });
  await tx.wait();
}

export async function unwrapWETH(
  underlyingTokenAddress: string,
  chainId: string,
  amountInWETH: string
) {
  const { signer } = await getSignerAndContract(chainId);
  const weth = new ethers.Contract(underlyingTokenAddress, WETH_ABI, signer);
  const amount = ethers.utils.parseEther(amountInWETH);

  const tx = await weth.withdraw(amount);
  await tx.wait();
}
