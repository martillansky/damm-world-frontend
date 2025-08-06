import { ReactNode } from "react";

export type BaseActionKey =
  | "ZOOM IN"
  | "ZOOM OUT"
  | "SUPPLY"
  | "CREATE"
  | "WITHDRAW"
  | "REDEEM"
  | "EXIT"
  | "DEPOSIT"
  | "CLAIM"
  | "SEND";

export interface ActionDefinition<K extends string = BaseActionKey> {
  key: K;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

export function createActions<K extends string>(
  keys: K[],
  config: Record<K, { label: string; icon?: ReactNode; onClick: () => void }>
): ActionDefinition<K>[] {
  return keys.map((key) => ({
    key,
    label: config[key].label,
    icon: config[key].icon,
    onClick: config[key].onClick,
  }));
}
