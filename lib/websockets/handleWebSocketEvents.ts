import { WebSocketEvent, WebSocketMessage } from "@/context/WebSocketContext";
import { DataPresenter } from "@/lib/data/types/DataPresenter.types";

export function handleVaultWebSocketEvent(
  vault: DataPresenter | null,
  message: WebSocketMessage
): DataPresenter | null {
  if (!vault || !message.data) return vault;

  const wsEvent: WebSocketEvent = message.data;

  switch (wsEvent.event) {
    case "deposit":
      return handleTxStatusEvent(vault, wsEvent.data);
    case "redeem":
      return handleTxStatusEvent(vault, wsEvent.data);
    default:
      console.warn("Unhandled WebSocket event:", message.event);
      return vault;
  }
}

function handleTxStatusEvent(
  vault: DataPresenter,
  data: WebSocketEvent["data"]
): DataPresenter {
  //{"status": "settled", "tx_hash": tx_hash})
  const typedData = data as { status: string; tx_hash: string };

  const updatedActivity = vault.activityData.map((tx) =>
    tx.txHash === typedData.tx_hash ? { ...tx, status: typedData.status } : tx
  );
  return { ...vault, activityData: updatedActivity };
}
