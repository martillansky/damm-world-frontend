import { AllowanceTransfer, PermitSingle } from "@uniswap/permit2-sdk";
import { BigNumber } from "ethers";
import { Address, encodeFunctionData, PublicClient, WalletClient } from "viem";
import Permit2Abi from "../../abis/Permit2.json";

export const PERMIT2_ADDRESS =
  "0x000000000022D473030F116dDEE9F6B43aC78BA3" satisfies Address; // mainnet & many testnets

// Max uint160 value: 2**160 - 1
export const MAX_UINT160 = (BigInt(1) << BigInt(160)) - BigInt(1);
export const DEFAULT_EXPIRATION =
  Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365 * 100; // 100 years

export function getPermit2ApproveTx({
  token,
  spender,
  amount = MAX_UINT160,
  expiration = DEFAULT_EXPIRATION,
}: {
  token: Address;
  spender: Address; // safe address
  amount?: bigint; // optional; defaults to MAX_UINT160
  expiration?: number; // optional; defaults to 100 years
}): {
  to: Address;
  data: `0x${string}`;
  value: BigNumber;
} {
  return {
    to: PERMIT2_ADDRESS,
    value: BigNumber.from(0),
    data: encodeFunctionData({
      abi: Permit2Abi,
      functionName: "approve",
      args: [token, spender, amount, expiration],
    }),
  };
}

export type Permit2TxPayloadType = {
  token: Address;
  owner: Address;
  to: Address; // safe address
  amount: BigNumber;
  deadline: number;
  publicClient: PublicClient;
  walletClient: WalletClient;
  chainId: number;
};

export async function getPermit2TransferTx({
  token,
  owner,
  to,
  amount,
  deadline,
  publicClient,
  walletClient,
  chainId,
}: Permit2TxPayloadType) {
  const nonce = await getPermit2Nonce(owner, token, to, publicClient!);

  const permit: PermitSingle = {
    details: {
      token,
      amount,
      expiration: deadline,
      nonce,
    },
    spender: to,
    sigDeadline: deadline,
  };

  const { domain, types, values } = AllowanceTransfer.getPermitData(
    permit,
    PERMIT2_ADDRESS,
    chainId
  );

  const signature = await walletClient.signTypedData({
    domain: {
      name: domain.name,
      version: domain.version,
      chainId: domain.chainId as number,
      verifyingContract: domain.verifyingContract,
    },
    types,
    primaryType: "PermitSingle",
    message: { ...values },
    account: owner,
  });

  const transferDetails = {
    to,
    requestedAmount: amount.toString(),
  };

  return {
    to: PERMIT2_ADDRESS,
    data: encodeFunctionData({
      abi: Permit2Abi,
      functionName: "permitTransferFrom",
      args: [
        {
          permitted: {
            token,
            amount: amount.toString(),
          },
          spender: to,
          nonce,
          deadline,
        },
        transferDetails,
        owner,
        signature,
      ],
    }),
    value: "0",
  };
}

export const getPermit2Nonce = async (
  owner: Address,
  token: Address,
  spender: Address,
  publicClient: PublicClient
): Promise<bigint> => {
  const result = await publicClient?.readContract({
    address: PERMIT2_ADDRESS,
    abi: Permit2Abi,
    functionName: "allowance",
    args: [owner, token, spender],
  });

  const [, , nonce] = result as unknown as [bigint, bigint, bigint];
  return nonce;
};

export function getPermit2TransferFromTx({
  from,
  to,
  amount,
  token,
}: {
  from: Address; // EOA
  to: Address; // receiver (Safe or vault)
  amount: bigint;
  token: Address;
}): {
  to: Address;
  data: `0x${string}`;
  value: "0";
} {
  return {
    to: PERMIT2_ADDRESS,
    value: "0",
    data: encodeFunctionData({
      abi: Permit2Abi,
      functionName: "transferFrom",
      args: [from, to, amount, token],
    }),
  };
}
