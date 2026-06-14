import { ActionRequest } from "./models";

export const BUY_GOLD_ACTION_TYPE = "BUY_GOLD";
export const GOLD_ALLOWED_CURRENCY = "XRP";
export const GOLD_TARGET_PREFIX = "gold:vault_";

export interface GoldActionDetails {
  goldAmountGrams: number;
  vaultId: string;
  currency: string;
}

function stringParameter(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function numberParameter(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return Number(value);
  }
  return 0;
}

export function isBuyGoldAction(action: ActionRequest): boolean {
  return action.action_type === BUY_GOLD_ACTION_TYPE;
}

export function getGoldActionDetails(action: ActionRequest): GoldActionDetails {
  const targetVaultId = action.target_resource.startsWith("gold:") ? action.target_resource.slice("gold:".length) : "";
  return {
    goldAmountGrams: numberParameter(action.parameters.goldAmountGrams ?? action.parameters.gold_amount_grams),
    vaultId: stringParameter(action.parameters.vaultId ?? action.parameters.vault_id) || targetVaultId,
    currency: String(action.parameters.settlementCurrency ?? action.parameters.currency ?? "").toUpperCase(),
  };
}

export function goldAuditFields(action: ActionRequest): Record<string, unknown> {
  if (!isBuyGoldAction(action)) {
    return {};
  }
  const { goldAmountGrams, vaultId } = getGoldActionDetails(action);
  return { goldAmountGrams, vaultId };
}
