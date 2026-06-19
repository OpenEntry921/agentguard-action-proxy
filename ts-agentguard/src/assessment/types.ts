export interface AssessmentQuestion {
  id: string;
  domain:
    | "AI_USAGE"
    | "DATA_PROTECTION"
    | "ACCESS_CONTROL"
    | "AUDIT_TRACEABILITY"
    | "AGENT_RISK";

  title: string;
}

export type AssessmentAnswerValue = 0 | 1 | 2 | 3 | 5;

export type AssessmentRiskLevel = "Critical Risk" | "High Risk" | "Medium Risk" | "Low Risk" | "Optimized";

export interface AssessmentAnswer {
  questionId: string;
  value: AssessmentAnswerValue;
}

export interface DomainScore {
  domain: AssessmentQuestion["domain"];
  label: string;
  score: number;
  maxScore: 20;
}

export interface MaturityLevel {
  level: 1 | 2 | 3 | 4 | 5;
  label: "Ad-hoc" | "Controlled" | "Managed" | "Governed" | "Autonomous Governance";
  displayName: string;
}

export interface AssessmentResult {
  totalScore: number;
  maxScore: 100;
  riskLevel: AssessmentRiskLevel;
  maturityLevel: MaturityLevel;
  domainScores: DomainScore[];
}
