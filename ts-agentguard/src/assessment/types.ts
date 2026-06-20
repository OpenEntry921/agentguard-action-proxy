export type AssessmentDomain =
  | "FINANCIAL_ACTIONS"
  | "AI_RISK_MANAGEMENT"
  | "PRIVACY_DATA_PROTECTION"
  | "MODEL_GOVERNANCE_HUMAN_OVERSIGHT"
  | "STRATEGIC_GOVERNANCE";

export interface AssessmentQuestion {
  id: string;
  domain: AssessmentDomain;
  title: string;
  displayId: string;
}

export type AssessmentAnswerValue = 0 | 1 | 2 | 4;
export type AssessmentRiskLevel = "Critical Risk" | "High Risk" | "Medium Risk" | "Low Risk";
export type AssessmentGrade = "D" | "C" | "B" | "A" | "A+";
export type AssessmentReadiness = "Not Ready" | "Partially Ready" | "Ready" | "Advanced";

export interface AssessmentAnswer {
  questionId: string;
  value: AssessmentAnswerValue;
}

export type AssessmentAnswerLabel = "NO" | "NOT SURE" | "PARTIAL" | "YES";

export interface QuestionExplanation {
  questionId: string;
  displayId: string;
  title: string;
  answer: AssessmentAnswerLabel;
  points: AssessmentAnswerValue;
  maxPoints: 4;
  impact: string;
}

export interface DomainExplanation {
  domain: AssessmentDomain;
  label: string;
  score: number;
  maxScore: 100;
  answeredPoints: number;
  maxPoints: number;
  answerBreakdown: QuestionExplanation[];
  findings: string[];
  narrative: string;
}

export interface DomainScore {
  domain: AssessmentDomain;
  label: string;
  score: number;
  maxScore: 100;
}

export interface PriorityRisk {
  domain: AssessmentDomain;
  label: string;
  score: number;
  description: string;
}

export interface RecommendedActionGroup {
  label: "30 Days" | "90 Days" | "180 Days";
  actions: string[];
}

export interface MaturityLevel {
  level: 1 | 2 | 3 | 4 | 5;
  label: "Initial" | "Developing" | "Managed" | "Governed" | "Optimized";
  displayName: string;
}

export interface AssessmentResult {
  totalScore: number;
  maxScore: 100;
  riskLevel: AssessmentRiskLevel;
  maturityLevel: MaturityLevel;
  governanceGrade: AssessmentGrade;
  aiReadiness: AssessmentReadiness;
  domainScores: DomainScore[];
  priorityRisks: PriorityRisk[];
  explanations: DomainExplanation[];
  recommendedActions: RecommendedActionGroup[];
  executiveSummary: string;
  regulatoryReadiness: string;
  controlMaturity: string;
  auditReadiness: string;
}
