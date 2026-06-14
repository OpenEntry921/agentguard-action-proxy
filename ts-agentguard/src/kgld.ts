import { ActionRequest } from "./models";

export const BORROW_RLUSD_AGAINST_KGLD_ACTION_TYPE = "BORROW_RLUSD_AGAINST_KGLD";

export interface KgldLendingDetails {
  collateralAmountKGLD: number;
  kgldPriceRLUSD: number;
  loanAmountRLUSD: number;
  collateralValueRLUSD: number;
  ltv: number;
  vaultId: string;
  collateralAsset: string;
  liquidityAsset: string;
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

export function isKgldLendingAction(action: ActionRequest): boolean {
  return action.action_type === BORROW_RLUSD_AGAINST_KGLD_ACTION_TYPE;
}

export function getKgldLendingDetails(action: ActionRequest): KgldLendingDetails {
  const collateralAmountKGLD = numberParameter(action.parameters.collateralAmountKGLD);
  const kgldPriceRLUSD = numberParameter(action.parameters.kgldPriceRLUSD);
  const loanAmountRLUSD = numberParameter(action.parameters.loanAmountRLUSD);
  const contextCollateralValue = numberParameter(action.context.collateralValueRLUSD);
  const collateralValueRLUSD = contextCollateralValue || collateralAmountKGLD * kgldPriceRLUSD;
  const contextLtv = numberParameter(action.context.ltv);
  const ltv = contextLtv || (collateralValueRLUSD > 0 ? (loanAmountRLUSD / collateralValueRLUSD) * 100 : 0);
  const targetVaultId = action.target_resource.startsWith("kgld:") ? action.target_resource.slice("kgld:".length) : "";

  return {
    collateralAmountKGLD,
    kgldPriceRLUSD,
    loanAmountRLUSD,
    collateralValueRLUSD,
    ltv,
    vaultId: stringParameter(action.context.vaultId ?? action.parameters.vaultId) || targetVaultId,
    collateralAsset: stringParameter(action.context.collateralAsset) || "KGLD",
    liquidityAsset: stringParameter(action.context.liquidityAsset) || "RLUSD",
  };
}

export function kgldAuditFields(action: ActionRequest): Record<string, unknown> {
  if (!isKgldLendingAction(action)) {
    return {};
  }

  return { ...getKgldLendingDetails(action) };
}
