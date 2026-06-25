import type { GovernOpsRuntimePolicy } from "./compiler";
import type { GovernOpsRuntimeContext } from "./context";
import type { GovernOpsDecisionRecord } from "./decision-record";
import type { GovernOpsHarnessResult, GovernOpsProposedAction } from "./harness";

export const kgldRuntimePolicySample: GovernOpsRuntimePolicy = {
  policyId: "KGLD-GOVERNOPS-POLICY-001",
  sourceQuestionIds: ["Q031", "Q032", "Q053"],
  actionTaxonomy: "gold.purchase",
  budgetLimit: 5000000,
  approvalRequired: true,
  enforcementType: "BLOCK",
  decisionRecordLevel: "FORENSIC",
  identityRequirement: "AGENT_IDENTITY_REQUIRED",
  contextRequirement: "USER_REQUEST_AMOUNT_MATCH_REQUIRED",
};

export const kgldRuntimeContextSample: GovernOpsRuntimeContext = {
  contextId: "CTX-KGLD-001",
  userRequestAmount: 5000000,
  agentDecisionAmount: 50000000,
  deviationPercent: 900,
  promptHash: "kgld-demo-user-request-gold-5m",
  ragHash: "kgld-demo-rag-context-v1",
  reputationScore: 80,
  riskScore: 95,
  timestamp: "2026-06-25T00:00:00.000Z",
};

export const kgldDecisionRecordSample: GovernOpsDecisionRecord & {
  agentRole: "financial_agent";
} = {
  decisionId: "DEC-KGLD-001",
  policyId: kgldRuntimePolicySample.policyId,
  sourceQuestionIds: kgldRuntimePolicySample.sourceQuestionIds,
  agentId: "AGT-001",
  agentRole: "financial_agent",
  contextId: kgldRuntimeContextSample.contextId,
  userRequestAmount: 5000000,
  agentDecisionAmount: 50000000,
  riskScore: kgldRuntimeContextSample.riskScore,
  enforcementAction: "BLOCK",
  approvalState: "PENDING",
  tokenStatus: "NOT_ISSUED",
  executionResult: "NOT_EXECUTED",
  auditCorrelationId: "AUD-KGLD-001",
  createdAt: "2026-06-25T00:00:00.000Z",
};

export const kgldProposedActionSample: GovernOpsProposedAction = {
  actionId: "ACT-KGLD-001",
  actionTaxonomy: "gold.purchase",
  targetSystem: "KGLD_DEMO_VAULT",
  targetResource: "GOLD_PURCHASE_ORDER",
  amount: 50000000,
  asset: "KRW",
  requestedBy: "user-request-gold-5m",
  generatedByAgent: "AGT-001",
  timestamp: "2026-06-25T00:00:00.000Z",
};

export const kgldHarnessResultSample: GovernOpsHarnessResult = {
  enforcementAction: "BLOCK",
  reason: "Agent decision amount deviates 900% from the user-requested gold purchase budget.",
  sourceQuestionIds: kgldRuntimePolicySample.sourceQuestionIds,
  policyId: kgldRuntimePolicySample.policyId,
  decisionId: kgldDecisionRecordSample.decisionId,
  approvalState: "PENDING",
  executionAllowed: false,
  tokenStatus: "NOT_ISSUED",
};
