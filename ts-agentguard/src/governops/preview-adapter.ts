import type { GovernOpsRuntimePolicy } from "./compiler";
import type { GovernOpsRuntimeContext } from "./context";
import type { GovernOpsDecisionRecord } from "./decision-record";
import type { GovernOpsHarnessResult } from "./harness";
import {
  kgldDecisionRecordSample,
  kgldHarnessResultSample,
  kgldRuntimeContextSample,
  kgldRuntimePolicySample,
} from "./sample-kgld";

export interface GovernOpsPreview {
  runtimePolicy: GovernOpsRuntimePolicy;
  runtimeContext: GovernOpsRuntimeContext;
  decisionRecord: GovernOpsDecisionRecord;
  harnessResult: GovernOpsHarnessResult;
  summary: string;
}

export function createGovernOpsPreview(): GovernOpsPreview {
  return {
    runtimePolicy: kgldRuntimePolicySample,
    runtimeContext: kgldRuntimeContextSample,
    decisionRecord: kgldDecisionRecordSample,
    harnessResult: kgldHarnessResultSample,
    summary:
      "User requested 5M KRW.\n" +
      "Agent attempted 50M KRW.\n" +
      "GovernOps blocked execution before settlement.\n" +
      "Token was not issued.",
  };
}
