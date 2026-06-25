export interface GovernOpsDecisionRecord {
  decisionId: string;
  requestId: string;
  policyId?: string;
  outcome: "ALLOW" | "REVIEW_REQUIRED" | "DENY" | "UNKNOWN";
  reasons: string[];
  recordedAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface GovernOpsDecisionRecordInput {
  requestId: string;
  policyId?: string;
  outcome?: GovernOpsDecisionRecord["outcome"];
  reasons?: string[];
  metadata?: Record<string, unknown>;
}

export function createGovernOpsDecisionRecord(): GovernOpsDecisionRecord {
  // TODO: Convert runtime policy evaluation output into a GovernOps decision record.
  throw new Error("TODO: GovernOps decision record creation is not implemented.");
}
