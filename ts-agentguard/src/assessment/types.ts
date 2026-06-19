export type AssessmentDomain =
  | "ai_usage"
  | "data_protection"
  | "access_control"
  | "audit_traceability"
  | "agent_risk";

export type AssessmentAnswerValue = 0 | 1 | 3 | 5;

export type AssessmentRiskLevel = "Critical Risk" | "High Risk" | "Medium Risk" | "Low Risk" | "Optimized";

export interface AssessmentQuestion {
  id: string;
  domain: AssessmentDomain;
  domainLabel: string;
  prompt: string;
}

export interface AssessmentAnswer {
  questionId: string;
  value: AssessmentAnswerValue;
}

export interface DomainScore {
  domain: AssessmentDomain;
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
