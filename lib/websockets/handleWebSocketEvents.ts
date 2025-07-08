import { WebSocketMessage } from "@/context/WebSocketContext";
import { DataPresenter } from "@/lib/data/types/DataPresenter.types";
import { ActivityDataApiResponse } from "../api/types/VaultData.types";
import { convertActivityData } from "../api/utils/ActivityDataConverter";

export function handleVaultWebSocketEvent(
  vault: DataPresenter | null,
  message: WebSocketMessage
): DataPresenter | null {
  if (!vault || !message.data) return vault;

  switch (message.event) {
    case "deposit":
      return handleTxStatusEvent(vault, message.data);
    case "redeem":
      return handleTxStatusEvent(vault, message.data);
    case "new_tx":
      return handleNewTxEvent(vault, message.data);
    default:
      console.warn("Unhandled WebSocket event:", message.event);
      return vault;
  }
}

function handleTxStatusEvent(
  vault: DataPresenter,
  data: unknown
): DataPresenter {
  //{"status": "settled", "tx_hash": tx_hash})
  const typedData = data as { status: string; tx_hash: string };

  const updatedActivity = vault.activityData.map((tx) =>
    tx.txHash === typedData.tx_hash ? { ...tx, status: typedData.status } : tx
  );
  return { ...vault, activityData: updatedActivity };
}

function handleNewTxEvent(vault: DataPresenter, data: unknown): DataPresenter {
  /* 
    {
        "tx_type": "deposit", 
        "tx_status": "pending", 
        "event_timestamp": event_timestamp, 
        "tx_hash": tx_hash, 
        "block": block_number, 
        "assets": assets
    }
    */

  const txData = data as { tx_type: string };
  const typedData = data as ActivityDataApiResponse;
  typedData["return_type"] = txData.tx_type;
  typedData["source_table"] =
    txData.tx_type === "withdraw" ? "vault_returns" : txData.tx_type;

  const newTx = convertActivityData([typedData], 18);
  return { ...vault, activityData: [newTx[0], ...vault.activityData] };
}
