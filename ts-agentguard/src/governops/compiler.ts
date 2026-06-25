import type { GovernOpsActionTaxonomy, GovernOpsEnforcementAction } from "./context";

export interface GovernOpsCompilerInput {
  agafDocument: unknown;
  targetRuntime?: string;
  metadata?: Record<string, unknown>;
}

export interface GovernOpsRuntimePolicy {
  policyId: string;
  sourceQuestionIds: string[];
  actionTaxonomy: GovernOpsActionTaxonomy;
  budgetLimit: number;
  approvalRequired: boolean;
  enforcementType: GovernOpsEnforcementAction;
  decisionRecordLevel: string;
  identityRequirement: string;
  contextRequirement: string;
}

export function compileGovernOpsRuntimePolicy(): GovernOpsRuntimePolicy {
  // TODO: Compile AGAF policy artifacts into a runtime policy placeholder.
  throw new Error("TODO: GovernOps runtime policy compilation is not implemented.");
}
