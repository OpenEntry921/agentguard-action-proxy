import { AssessmentResult } from "./scoring";

export function formatAssessmentResult(result: AssessmentResult): string {
  return JSON.stringify(result, null, 2);
}
