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

  const getRecentTxs = async (count = 50) => {
    const provider = getEthersProvider();
    const { vault } = await getSignerAndContract(
      network.chainId?.toString() ?? ""
    );
    const filterSettleDepositEvents = vault.filters.SettleDeposit();
    const filterCanceledDepositEvents = vault.filters.DepositRequestCanceled(
      null,
      address
    );
    const filterRedeemSettledEvents = vault.filters.SettleRedeem();

    const latestBlock = await provider.getBlockNumber();
    const txs: (TransactionResponse & {
      functionName: string;
      args: Result;
      isSettled: boolean;
      isCanceled: boolean;
    })[] = [];

    for (let i = latestBlock; i > latestBlock - count; i--) {
      const block = await provider.getBlockWithTransactions(i);
      const filteredTxs = block.transactions.filter(
        (tx) => tx.from === address || tx.to === address
      );

      const parsedTxs = await Promise.all(
        filteredTxs.map(async (tx) => {
          const parsedTx = await parseTx(tx);

          const checkSettleDepositEvent = async (): Promise<{
            isSettled: boolean;
            isCanceled: boolean;
          }> => {
            if (parsedTx.functionName === "requestDeposit") {
              const logsSettleDeposit = await vault.queryFilter(
                filterSettleDepositEvents,
                tx.blockNumber ? tx.blockNumber + 1 : 0
              );
              const logsCancelDeposit = await vault.queryFilter(
                filterCanceledDepositEvents,
                tx.blockNumber ? tx.blockNumber + 1 : 0
              );
              if (logsSettleDeposit.length > 0) {
                if (
                  logsCancelDeposit.length > 0 &&
                  logsSettleDeposit[0].blockNumber >
                    logsCancelDeposit[0].blockNumber
                ) {
                  return { isSettled: false, isCanceled: true };
                }
                return { isSettled: true, isCanceled: false };
              } else {
                if (logsCancelDeposit.length > 0) {
                  return { isSettled: false, isCanceled: true };
                }
              }
            } else if (parsedTx.functionName === "requestRedeem") {
              const logs = await vault.queryFilter(
                filterRedeemSettledEvents,
                tx.blockNumber ? tx.blockNumber + 1 : 0
              );
              if (logs.length > 0) {
                return { isSettled: true, isCanceled: false };
              }
            }

            return { isSettled: false, isCanceled: false };
          };

          const { isSettled, isCanceled } = await checkSettleDepositEvent();

          return {
            ...tx,
            ...parsedTx,
            isSettled,
            isCanceled,
            timestamp: block.timestamp,
            vaultAddress: vault.address,
          } as TransactionResponse & {
            functionName: string;
            args: Result;
            isSettled: boolean;
            isCanceled: boolean;
            vaultAddress: string;
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
