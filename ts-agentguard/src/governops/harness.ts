import type {
  GovernOpsActionTaxonomy,
  GovernOpsApprovalState,
  GovernOpsEnforcementAction,
  GovernOpsRuntimeContext,
  GovernOpsTokenStatus,
} from "./context";
import type { GovernOpsRuntimePolicy } from "./compiler";

export interface GovernOpsProposedAction {
  actionId: string;
  actionTaxonomy: GovernOpsActionTaxonomy;
  targetSystem: string;
  targetResource: string;
  amount: number;
  asset: string;
  requestedBy: string;
  generatedByAgent: string;
  timestamp: string;
}

export interface GovernOpsHarnessInput {
  context: GovernOpsRuntimeContext;
  policy: GovernOpsRuntimePolicy;
  action: GovernOpsProposedAction;
}

export interface GovernOpsHarnessResult {
  enforcementAction: GovernOpsEnforcementAction;
  reason: string;
  sourceQuestionIds: string[];
  policyId: string;
  decisionId: string;
  approvalState: GovernOpsApprovalState;
  executionAllowed: boolean;
  tokenStatus: GovernOpsTokenStatus;
}

export function runGovernOpsHarness(): GovernOpsHarnessResult {
  // TODO: Connect runtime policy evaluation to token generation and AgentGuard execution flow.
  throw new Error("TODO: GovernOps harness execution is not implemented.");
}
