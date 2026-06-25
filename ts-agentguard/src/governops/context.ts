export interface GovernOpsRuntimeContext {
  requestId: string;
  actorId: string;
  sourceSystem: string;
  metadata?: Record<string, unknown>;
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
