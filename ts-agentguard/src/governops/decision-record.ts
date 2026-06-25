import type {
  GovernOpsApprovalState,
  GovernOpsEnforcementAction,
  GovernOpsTokenStatus,
} from "./context";

export interface GovernOpsDecisionRecord {
  decisionId: string;
  policyId: string;
  sourceQuestionIds: string[];
  agentId: string;
  contextId: string;
  userRequestAmount: number;
  agentDecisionAmount: number;
  riskScore: number;
  enforcementAction: GovernOpsEnforcementAction;
  approvalState: GovernOpsApprovalState;
  tokenStatus: GovernOpsTokenStatus;
  executionResult: string;
  auditCorrelationId: string;
  createdAt: string;
}

export type GovernOpsDecisionRecordInput = Omit<GovernOpsDecisionRecord, "decisionId" | "createdAt"> & {
  decisionId?: string;
  createdAt?: string;
};

export function createGovernOpsDecisionRecord(): GovernOpsDecisionRecord {
  // TODO: Convert runtime policy evaluation output into a GovernOps decision record.
  throw new Error("TODO: GovernOps decision record creation is not implemented.");
}
