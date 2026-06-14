import { getGoldActionDetails } from "../gold";
import type { ActionRequest, ExecutionResult } from "../models";

interface SettlementCreateResponse {
  id: string;
  status: string;
}

interface SettlementExecuteResponse {
  id: string;
  status: string;
  txHash?: string;
  ledgerIndex?: number;
  network?: string;
}

function readString(value: unknown, fallback = ""): string {
  if (value === undefined || value === null) {
    return fallback;
  }

  return String(value);
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
    const memo = `AgentGuard BUY_GOLD ${action.target_resource} ${goldAmountGrams}g`;

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
          message: `Settlement creation failed: ${createResponse.status}`,
        };
      }

      const settlement = (await createResponse.json()) as SettlementCreateResponse;
      const executeResponse = await fetch(`${this.baseUrl}/settlements/${settlement.id}/execute`, {
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
          settlementId: settlement.id,
          message: `Settlement execution failed: ${executeResponse.status}`,
        };
      }

      const result = (await executeResponse.json()) as SettlementExecuteResponse;

      return {
        action_id: action.action_id,
        decision: result.status === "SETTLED" ? "ALLOW" : "BLOCKED",
        executed: result.status === "SETTLED",
        executor: "settlement_orchestrator",
        settlementId: settlement.id,
        txHash: result.txHash,
        ledgerIndex: result.ledgerIndex,
        network: result.network,
        message: `Settlement Orchestrator execution completed. status=${result.status}, network=${result.network}, txHash=${result.txHash}`,
      };
    } catch (error) {
      return {
        action_id: action.action_id,
        decision: "BLOCKED",
        executed: false,
        executor: "settlement_orchestrator",
        message: `Settlement Orchestrator request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }
}
