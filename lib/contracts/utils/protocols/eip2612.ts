import { AllowanceTransfer, PermitSingle } from "@uniswap/permit2-sdk";
import { BigNumber } from "ethers";
import { Address, encodeFunctionData, PublicClient, WalletClient } from "viem";
import ERC20Abi from "../../abis/IERC20.json";

// Max uint160 value: 2**160 - 1
export const MAX_UINT160 = (BigInt(1) << BigInt(160)) - BigInt(1);
export const DEFAULT_EXPIRATION =
  Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365 * 100; // 100 years

export async function getERC20Signature({
  token,
  spender,
  owner,
  chainId,
  publicClient,
  walletClient,
  amount = MAX_UINT160,
  deadline = DEFAULT_EXPIRATION,
}: {
  token: Address;
  spender: Address;
  owner: Address;
  chainId: number;
  publicClient: PublicClient;
  walletClient: WalletClient;
  amount?: bigint;
  deadline?: number;
}): Promise<{ permit: PermitSingle; signature: `0x${string}` }> {
  const nonce = await getERC20Nonce(owner, token, spender, publicClient);

  const permit: PermitSingle = {
    details: {
      token,
      amount,
      expiration: deadline,
      nonce,
    },
    spender,
    sigDeadline: deadline,
  };

  const { domain, types, values } = AllowanceTransfer.getPermitData(
    permit,
    token,
    chainId
  );

  const signature = await walletClient.signTypedData({
    account: owner,
    domain: {
      name: domain.name,
      version: domain.version,
      chainId: domain.chainId as number,
      verifyingContract: domain.verifyingContract,
    },
    types,
    primaryType: "PermitSingle",
    message: { ...values },
  });

  return { permit, signature };
}

export function getERC20PermitTx({
  token,
  owner,
  permit,
  signature,
}: {
  token: Address;
  owner: Address;
  permit: PermitSingle;
  signature: `0x${string}`;
}): {
  to: Address;
  data: `0x${string}`;
  value: "0";
} {
  return {
    to: token,
    value: "0",
    data: encodeFunctionData({
      abi: ERC20Abi,
      functionName: "permit",
      args: [owner, permit, signature],
    }),
  };
}

export function getERC20ApproveTx({
  token,
  spender,
  amount = MAX_UINT160,
}: {
  token: Address;
  spender: Address; // safe address
  amount?: bigint; // optional; defaults to MAX_UINT160
}): {
  to: Address;
  data: `0x${string}`;
  value: BigNumber;
} {
  return {
    to: token,
    value: BigNumber.from(0),
    data: encodeFunctionData({
      abi: ERC20Abi,
      functionName: "approve",
      args: [spender, amount],
    }),
  };
}

export type ERC20TxPayloadType = {
  token: Address;
  owner: Address;
  to: Address; // safe address
  amount: BigNumber;
  deadline: number;
  publicClient: PublicClient;
  walletClient: WalletClient;
  chainId: number;
};

export async function getERC20PermitTransferFromTx({
  token,
  owner,
  to,
  amount,
  deadline,
  publicClient,
  walletClient,
  chainId,
}: ERC20TxPayloadType) {
  const { permit, signature } = await getERC20Signature({
    token,
    amount: amount.toBigInt(),
    spender: to,
    owner,
    chainId,
    deadline,
    publicClient,
    walletClient,
  });

  const transferDetails = {
    to,
    requestedAmount: amount.toString(),
  };

  return {
    to: token,
    data: encodeFunctionData({
      abi: ERC20Abi,
      functionName: "permitTransferFrom",
      args: [
        {
          permitted: {
            token: permit.details.token,
            amount: permit.details.amount.toString(),
          },
          spender: permit.spender,
          nonce: permit.details.nonce,
          deadline: permit.sigDeadline,
        },
        transferDetails,
        owner,
        signature,
      ],
    }),
    value: "0",
  };
}

export const getERC20Nonce = async (
  owner: Address,
  token: Address,
  spender: Address,
  publicClient: PublicClient
): Promise<bigint> => {
  const result = await publicClient?.readContract({
    address: token,
    abi: ERC20Abi,
    functionName: "allowance",
    args: [owner, token, spender],
  });

  const [, , nonce] = result as unknown as [bigint, bigint, bigint];
  return nonce;
};

export function getERC20TransferFromTx({
  from,
  to,
  amount,
  token,
}: {
  from: Address; // EOA
  to: Address; // receiver (Safe)
  amount: bigint;
  token: Address;
}): {
  to: Address;
  data: `0x${string}`;
  value: "0";
} {
  return {
    to: token,
    value: "0",
    data: encodeFunctionData({
      abi: ERC20Abi,
      functionName: "transferFrom",
      args: [from, to, amount],
    }),
  };
}

export function getERC20TransferTx({
  to,
  amount,
  token,
}: {
  to: Address; // receiver (Safe)
  amount: bigint;
  token: Address;
}): {
  to: Address;
  data: `0x${string}`;
  value: "0";
} {
  return {
    to: token,
    value: "0",
    data: encodeFunctionData({
      abi: ERC20Abi,
      functionName: "transfer",
      args: [to, amount],
    }),
  };
}

export async function isERC20Approved({
  token,
  owner,
  spender,
  publicClient,
  amount,
}: {
  token: Address;
  owner: Address;
  spender: Address;
  publicClient: PublicClient;
  amount?: bigint;
}): Promise<boolean> {
  const allowance = (await publicClient.readContract({
    address: token,
    abi: ERC20Abi,
    functionName: "allowance",
    args: [owner, spender],
  })) as bigint;

  const requiredAmount = amount || BigNumber.from(MAX_UINT160);
  const isApproved = BigNumber.from(allowance).gte(requiredAmount);

  return isApproved;
}

export async function isERC20Permited({
  token,
  owner,
  spender,
  requiredAmount = MAX_UINT160,
  publicClient,
}: {
  token: Address;
  owner: Address;
  spender: Address;
  requiredAmount?: bigint;
  publicClient: PublicClient;
}): Promise<boolean> {
  const [allowedAmount, expiration] = (await publicClient.readContract({
    address: token,
    abi: ERC20Abi,
    functionName: "allowance",
    args: [owner, token, spender],
  })) as [bigint, bigint, bigint];

  const now = BigInt(Math.floor(Date.now() / 1000));
  const isExpired = expiration < now;
  const hasEnoughAllowance = allowedAmount >= requiredAmount;

  return !hasEnoughAllowance || isExpired;
}
