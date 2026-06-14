import { getGoldActionDetails, isBuyGoldAction } from "../gold";
import { getKgldLendingDetails, isKgldLendingAction } from "../kgld";
import type { ActionRequest, ExecutionResult } from "../models";

type JsonObject = Record<string, unknown>;

interface SettlementCreateResponse extends JsonObject {
  id?: string;
  settlementId?: string;
}

interface SettlementExecuteResponse extends JsonObject {
  id?: string;
  settlementId?: string;
  status?: string;
  txHash?: string;
  hash?: string;
  ledgerIndex?: number;
  ledger_index?: number;
  network?: string;
  result?: JsonObject;
  settlement?: JsonObject;
  transaction?: JsonObject;
}

function readString(value: unknown, fallback = ""): string {
  if (value === undefined || value === null) {
    return fallback;
  }

  return String(value);
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  return undefined;
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return undefined;
}

function objectValue(value: unknown): JsonObject | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as JsonObject) : undefined;
}

async function readJson(response: Response): Promise<JsonObject> {
  const value = (await response.json()) as unknown;
  return objectValue(value) ?? {};
}

function extractSettlementId(response: SettlementCreateResponse | SettlementExecuteResponse): string | undefined {
  const result = objectValue(response.result);
  const settlement = objectValue(response.settlement);

  return firstString(
    response.settlementId,
    response.id,
    result?.settlementId,
    result?.id,
    settlement?.settlementId,
    settlement?.id,
  );
}

function extractTransactionFields(response: SettlementExecuteResponse) {
  const result = objectValue(response.result);
  const settlement = objectValue(response.settlement);
  const transaction = objectValue(response.transaction) ?? objectValue(result?.transaction);

  return {
    status: firstString(response.status, result?.status, settlement?.status),
    txHash: firstString(response.txHash, response.hash, result?.txHash, result?.hash, transaction?.txHash, transaction?.hash),
    ledgerIndex: readNumber(
      response.ledgerIndex ?? response.ledger_index ?? result?.ledgerIndex ?? result?.ledger_index ?? transaction?.ledgerIndex ?? transaction?.ledger_index,
    ),
    network: firstString(response.network, result?.network, settlement?.network, transaction?.network),
  };
}

export class SettlementOrchestratorExecutor {
  private readonly baseUrl: string;

  constructor(baseUrl = process.env.SETTLEMENT_ORCHESTRATOR_URL ?? "http://localhost:3000/api/v1") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  preview(actionRequest: ActionRequest): Record<string, unknown> {
    const { goldAmountGrams, vaultId, currency } = getGoldActionDetails(actionRequest);
    return {
      executor: "settlement_orchestrator",
      summary: `Would request settlement for ${goldAmountGrams}g gold in ${vaultId} using ${currency}`,
      network: "xrpl-testnet",
    };
  }

  async execute(action: ActionRequest, executionToken: string): Promise<ExecutionResult> {
    const fromAccount = process.env.GOLD_DEMO_FROM_ACCOUNT;
    const toAccount = process.env.GOLD_DEMO_TO_ACCOUNT;

    if (!fromAccount || !toAccount) {
      return {
        action_id: action.action_id,
        decision: "BLOCKED",
        executed: false,
        message: "Gold demo settlement accounts are not configured.",
        executor: "settlement_orchestrator",
      };
    }

    const goldAmountGrams = readString(action.parameters.goldAmountGrams);
    const settlementAmount = readString(action.parameters.settlementAmount, "1");
    const settlementCurrency = readString(
      action.parameters.settlementCurrency ?? action.parameters.currency,
      process.env.GOLD_DEMO_SETTLEMENT_CURRENCY ?? "XRP",
    );
    const kgld = isKgldLendingAction(action) ? getKgldLendingDetails(action) : undefined;
    const memo = isBuyGoldAction(action)
      ? `AgentGuard BUY_GOLD ${action.target_resource} ${goldAmountGrams}g`
      : `AgentGuard KGLD_RLUSD_LOAN ${kgld?.vaultId ?? action.target_resource} ${kgld?.loanAmountRLUSD ?? ""} RLUSD LTV ${kgld?.ltv ?? ""}%`;

    try {
      const createResponse = await fetch(`${this.baseUrl}/settlements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-AgentGuard-Execution-Token": executionToken,
          "X-AgentGuard-Action-Id": action.action_id,
        },
        body: JSON.stringify({
          fromAccount,
          toAccount,
          amount: settlementAmount,
          currency: settlementCurrency,
          memo,
        }),
      });

      if (!createResponse.ok) {
        return {
          action_id: action.action_id,
          decision: "BLOCKED",
          executed: false,
          executor: "settlement_orchestrator",
          message: "Settlement creation failed",
        };
      }

      const settlement = (await readJson(createResponse)) as SettlementCreateResponse;
      const settlementId = extractSettlementId(settlement);
      if (!settlementId) {
        return {
          action_id: action.action_id,
          decision: "BLOCKED",
          executed: false,
          executor: "settlement_orchestrator",
          message: "Settlement creation failed",
        };
      }

      const executeResponse = await fetch(`${this.baseUrl}/settlements/${settlementId}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-AgentGuard-Execution-Token": executionToken,
          "X-AgentGuard-Action-Id": action.action_id,
        },
      });

      if (!executeResponse.ok) {
        return {
          action_id: action.action_id,
          decision: "BLOCKED",
          executed: false,
          executor: "settlement_orchestrator",
          settlementId,
          message: "Settlement execution failed",
        };
      }

      const result = (await readJson(executeResponse)) as SettlementExecuteResponse;
      const transaction = extractTransactionFields(result);
      const executed = Boolean(transaction.txHash);

      if (!executed) {
        return {
          action_id: action.action_id,
          decision: "BLOCKED",
          executed: false,
          executor: "settlement_orchestrator",
          settlementId,
          network: transaction.network,
          message: "Settlement execution failed",
        };
      }

      return {
        action_id: action.action_id,
        decision: "ALLOW",
        executed: true,
        executor: "settlement_orchestrator",
        settlementId,
        txHash: transaction.txHash,
        ledgerIndex: transaction.ledgerIndex,
        network: transaction.network,
        message: "Settlement Orchestrator execution completed.",
      };
    } catch {
      return {
        action_id: action.action_id,
        decision: "BLOCKED",
        executed: false,
        executor: "settlement_orchestrator",
        message: "Settlement Orchestrator request failed",
      };
    }
  }
}
