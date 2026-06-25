export type GovernOpsActionTaxonomy =
  | "gold.purchase"
  | "kgld.borrow_rlusd"
  | "agent.lifecycle.kill_switch";

export type GovernOpsAgentRole = "financial_agent" | "automated_buyer";

export type GovernOpsEnforcementAction = "ALLOW" | "REVIEW" | "BLOCK" | "FREEZE" | "ESCALATE";

export type GovernOpsApprovalState =
  | "NOT_REQUIRED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "OVERRIDDEN";

export type GovernOpsTokenStatus =
  | "NOT_ISSUED"
  | "ISSUED"
  | "USED"
  | "EXPIRED"
  | "REVOKED"
  | "BURNED";

export interface GovernOpsRuntimeContext {
  contextId: string;
  userRequestAmount: number;
  agentDecisionAmount: number;
  deviationPercent: number;
  promptHash: string;
  ragHash: string;
  reputationScore: number;
  riskScore: number;
  timestamp: string;
}

export interface GovernOpsRuntimePolicyContext {
  policyId: string;
  policyVersion?: string;
  inputs: Record<string, unknown>;
}

export function createGovernOpsRuntimeContext(): GovernOpsRuntimeContext {
  // TODO: Map AGAF and existing AgentGuard request context into GovernOps runtime context.
  throw new Error("TODO: GovernOps runtime context creation is not implemented.");
}
