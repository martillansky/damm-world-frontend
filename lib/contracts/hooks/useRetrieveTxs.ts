import { useAppKitNetwork } from "@reown/appkit/react";
import { Result } from "ethers/lib/utils";
import { useAccount } from "wagmi";
import { getEthersProvider, getSignerAndContract } from "../utils/utils";

type TransactionResponse = Awaited<
  ReturnType<ReturnType<typeof getEthersProvider>["getTransaction"]>
>;

type TxType =
  | "deposit"
  | "requestDeposit"
  | "withdraw"
  | "claim"
  | "redeem"
  | "requestRedeem"
  | "claim_and_redeem"
  | "sent"
  | "received";

export function useRetrieveTxs() {
  const { address } = useAccount();
  const network = useAppKitNetwork();

  const parseTx = async (tx: TransactionResponse) => {
    if (!address) throw new Error("No address found");

    const chainId = network.chainId?.toString() ?? "";
    const { vault } = await getSignerAndContract(chainId);

    const parsedTx = vault.interface.parseTransaction({
      data: tx.data,
      value: tx.value,
    });

    return {
      functionName: parsedTx.name as TxType,
      args: parsedTx.args,
    };
  };

  const getRecentTxs = async (count = 20) => {
    const provider = getEthersProvider();

    const latestBlock = await provider.getBlockNumber();
    const txs: (TransactionResponse & {
      functionName: string;
      args: Result;
    })[] = [];

    for (let i = latestBlock; i > latestBlock - count; i--) {
      const block = await provider.getBlockWithTransactions(i);
      const filteredTxs = block.transactions.filter(
        (tx) => tx.from === address || tx.to === address
      );

      const parsedTxs = await Promise.all(
        filteredTxs.map(async (tx) => {
          const parsedTx = await parseTx(tx);
          return {
            ...tx,
            ...parsedTx,
            timestamp: block.timestamp,
          } as TransactionResponse & {
            functionName: string;
            args: Result;
          };
        })
      );

      const validTxs = parsedTxs.filter(
        (tx) =>
          tx.functionName === "deposit" ||
          tx.functionName === "redeem" ||
          tx.functionName === "requestDeposit" ||
          tx.functionName === "requestRedeem"
      );

      txs.push(...validTxs);
    }

    return txs;
  };
  return { getRecentTxs };
}
