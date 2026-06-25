import { GovernOpsRuntimeContext } from "./context";
import { GovernOpsDecisionRecord } from "./decision-record";
import { GovernOpsRuntimePolicy } from "./compiler";

export interface GovernOpsHarnessInput {
  context: GovernOpsRuntimeContext;
  policy: GovernOpsRuntimePolicy;
  action: unknown;
}

export interface GovernOpsHarnessResult {
  decisionRecord: GovernOpsDecisionRecord;
  tokenRequest?: unknown;
  metadata?: Record<string, unknown>;
}

export function runGovernOpsHarness(): GovernOpsHarnessResult {
  // TODO: Connect runtime policy evaluation to token generation and AgentGuard execution flow.
  throw new Error("TODO: GovernOps harness execution is not implemented.");
}
