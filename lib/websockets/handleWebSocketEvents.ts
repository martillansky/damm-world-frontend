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
  const typedData = data as { status: string; tx_hash: string };

  const updatedActivity = vault.activityData.map((tx) =>
    tx.txHash === typedData.tx_hash ? { ...tx, status: typedData.status } : tx
  );
  return { ...vault, activityData: updatedActivity };
}

function handleNewTxEvent(vault: DataPresenter, data: unknown): DataPresenter {
  const typedData = data as ActivityDataApiResponse;
  if (typedData.assets) typedData.assets = Number(typedData.assets);
  if (typedData.shares) typedData.shares = Number(typedData.shares);
  const newTx = convertActivityData([typedData], 18);
  if (!newTx || newTx.length === 0) return vault;
  return { ...vault, activityData: [newTx[0], ...vault.activityData] };
}
