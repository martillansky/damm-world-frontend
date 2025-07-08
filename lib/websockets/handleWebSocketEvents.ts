import { WebSocketMessage } from "@/context/WebSocketContext";
import { DataPresenter } from "@/lib/data/types/DataPresenter.types";
import {
  ActivityDataApiResponse,
  IntegratedDataResponse,
  VaultDataResponse,
} from "../api/types/VaultData.types";
import { convertActivityData } from "../api/utils/ActivityDataConverter";
import {
  convertIntegratedPosition,
  IntegratedPosition,
} from "../api/utils/IntegratedPositionConverter";
import { DataWrangler } from "../data/utils/DataWrangler";

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
    case "integrated_position":
      return handleIntegratedPositionEvent(vault, message.data);
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

function handleIntegratedPositionEvent(
  vault: DataPresenter,
  data: unknown
): DataPresenter {
  const typedData = data as { positions: IntegratedPosition[] };
  const position = typedData.positions[0];

  // Convert string values to numbers for all numeric fields
  for (const field of Object.keys(position) as (keyof IntegratedPosition)[]) {
    if (field !== "vault_id") {
      position[field] = Number(position[field]);
    }
  }

  const newPosition: IntegratedDataResponse = convertIntegratedPosition(
    { positions: [position] },
    vault.positionData?.sharesInWallet
      ? Number(vault.positionData.sharesInWallet)
      : null,
    18
  );

  const newVaultData: VaultDataResponse = {
    vaultData: newPosition.vaultData,
    positionData: newPosition.positionData,
    activityData: vault.activityData,
  };

  return DataWrangler({ data: newVaultData });
}
