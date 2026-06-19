import { assessmentQuestions } from "./questions";
import { defaultIndustry, industryProfiles, IndustryType } from "./industry-profiles";
import { calculateAssessmentGrade, calculateReadinessIndicator } from "./executive-summary";
import { AssessmentAnswer, AssessmentGrade, AssessmentReadiness, AssessmentRiskLevel, DomainScore, MaturityLevel } from "./types";

export interface AssessmentResult {
  totalScore: number;

  aiUsage: number;
  dataProtection: number;
  accessControl: number;
  auditTraceability: number;
  agentRisk: number;

  maturityLevel: string;
  riskLevel: string;
  industry: IndustryType;
  weightedScore: number;
  industryRisk: AssessmentRiskLevel;
}

const maturityLevels: Array<{ min: number; max: number; value: string }> = [
  { min: 0, max: 20, value: "Level 1 Ad-hoc" },
  { min: 21, max: 40, value: "Level 2 Controlled" },
  { min: 41, max: 60, value: "Level 3 Managed" },
  { min: 61, max: 80, value: "Level 4 Governed" },
  { min: 81, max: 100, value: "Level 5 Autonomous Governance" },
];

const riskLevels: Array<{ min: number; max: number; value: AssessmentRiskLevel }> = [
  { min: 0, max: 20, value: "Critical Risk" },
  { min: 21, max: 40, value: "High Risk" },
  { min: 41, max: 60, value: "Medium Risk" },
  { min: 61, max: 80, value: "Low Risk" },
  { min: 81, max: 100, value: "Optimized" },
];

const domainQuestionIds = {
  aiUsage: ["AIU-01", "AIU-02", "AIU-03", "AIU-04", "ai_usage_1", "ai_usage_2", "ai_usage_3", "ai_usage_4"],
  dataProtection: [
    "DP-01",
    "DP-02",
    "DP-03",
    "DP-04",
    "data_protection_1",
    "data_protection_2",
    "data_protection_3",
    "data_protection_4",
  ],
  accessControl: [
    "AC-01",
    "AC-02",
    "AC-03",
    "AC-04",
    "access_control_1",
    "access_control_2",
    "access_control_3",
    "access_control_4",
  ],
  auditTraceability: [
    "AT-01",
    "AT-02",
    "AT-03",
    "AT-04",
    "audit_traceability_1",
    "audit_traceability_2",
    "audit_traceability_3",
    "audit_traceability_4",
  ],
  agentRisk: ["AR-01", "AR-02", "AR-03", "AR-04", "agent_risk_1", "agent_risk_2", "agent_risk_3", "agent_risk_4"],
};

function scoreFor(ids: string[], answers: Record<string, number>): number {
  return ids.reduce((sum, id) => sum + (answers[id] ?? 0), 0);
}

function calculateMaturityLabel(totalScore: number): string {
  return maturityLevels.find((entry) => totalScore >= entry.min && totalScore <= entry.max)?.value ?? maturityLevels[0].value;
}

export function calculateMaturityLevel(totalScore: number): MaturityLevel {
  const label = calculateMaturityLabel(totalScore);
  const [levelText, ...nameParts] = label.replace("Level ", "").split(" ");
  const level = Number(levelText) as MaturityLevel["level"];
  const name = nameParts.join(" ") as MaturityLevel["label"];
  return { level, label: name, displayName: label };
}

export function calculateAssessmentRiskLevel(totalScore: number): AssessmentRiskLevel {
  return riskLevels.find((entry) => totalScore >= entry.min && totalScore <= entry.max)?.value ?? "Critical Risk";
}

function calculateWeightedScore(scores: Pick<AssessmentResult, "aiUsage" | "dataProtection" | "accessControl" | "auditTraceability" | "agentRisk">, industry: IndustryType): number {
  const weights = industryProfiles[industry].weights;
  return Math.round(
    (scores.aiUsage / 20) * weights.aiUsage +
      (scores.dataProtection / 20) * weights.dataProtection +
      (scores.accessControl / 20) * weights.accessControl +
      (scores.auditTraceability / 20) * weights.auditTraceability +
      (scores.agentRisk / 20) * weights.agentRisk,
  );
}

function industryFromAnswers(answers: AssessmentAnswer[]): IndustryType {
  const marker = answers.find((answer) => answer.questionId.startsWith("industry_"));
  const industry = marker?.questionId.replace("industry_", "") as IndustryType | undefined;
  return industry && industry in industryProfiles ? industry : defaultIndustry;
}

export function calculateAssessment(answers: Record<string, number>, industry: IndustryType = defaultIndustry): AssessmentResult {
  const aiUsage = scoreFor(domainQuestionIds.aiUsage, answers);
  const dataProtection = scoreFor(domainQuestionIds.dataProtection, answers);
  const accessControl = scoreFor(domainQuestionIds.accessControl, answers);
  const auditTraceability = scoreFor(domainQuestionIds.auditTraceability, answers);
  const agentRisk = scoreFor(domainQuestionIds.agentRisk, answers);
  const totalScore = aiUsage + dataProtection + accessControl + auditTraceability + agentRisk;
  const weightedScore = calculateWeightedScore({ aiUsage, dataProtection, accessControl, auditTraceability, agentRisk }, industry);

  return {
    totalScore,
    aiUsage,
    dataProtection,
    accessControl,
    auditTraceability,
    agentRisk,
    maturityLevel: calculateMaturityLabel(totalScore),
    riskLevel: calculateAssessmentRiskLevel(totalScore),
    industry,
    weightedScore,
    industryRisk: calculateAssessmentRiskLevel(weightedScore),
  };
}

interface DashboardAssessmentResult {
  totalScore: number;
  maxScore: 100;
  riskLevel: AssessmentRiskLevel;
  maturityLevel: MaturityLevel;
  governanceGrade: AssessmentGrade;
  aiReadiness: AssessmentReadiness;
  domainScores: DomainScore[];
  industry: IndustryType;
  industryLabel: string;
  weightedScore: number;
  industryRisk: AssessmentRiskLevel;
  primaryRiskFocus: string;
  industryRecommendations: string[];
  industryCoreControlAreas: string[];
  industryPhases: Array<{ phase: string; title: string }>;
}

export function evaluateAssessment(answers: AssessmentAnswer[]): DashboardAssessmentResult {
  const industry = industryFromAnswers(answers);
  const profile = industryProfiles[industry];
  const answerValues = Object.fromEntries(answers.map((answer) => [answer.questionId, answer.value]));
  const calculated = calculateAssessment(answerValues, industry);
  const domainScores: DomainScore[] = [
    { domain: "AI_USAGE", label: "AI Usage", score: calculated.aiUsage, maxScore: 20 },
    { domain: "DATA_PROTECTION", label: "Data Protection", score: calculated.dataProtection, maxScore: 20 },
    { domain: "ACCESS_CONTROL", label: "Access Control", score: calculated.accessControl, maxScore: 20 },
    { domain: "AUDIT_TRACEABILITY", label: "Audit & Traceability", score: calculated.auditTraceability, maxScore: 20 },
    { domain: "AGENT_RISK", label: "Agent Risk", score: calculated.agentRisk, maxScore: 20 },
  ];

  return {
    totalScore: calculated.totalScore,
    maxScore: 100,
    riskLevel: calculateAssessmentRiskLevel(calculated.totalScore),
    maturityLevel: calculateMaturityLevel(calculated.totalScore),
    governanceGrade: calculateAssessmentGrade(calculated.totalScore),
    aiReadiness: calculateReadinessIndicator(calculated.totalScore),
    domainScores,
    industry: calculated.industry,
    industryLabel: profile.label,
    weightedScore: calculated.weightedScore,
    industryRisk: calculated.industryRisk,
    primaryRiskFocus: profile.primaryRiskFocus,
    industryRecommendations: profile.recommendations,
    industryCoreControlAreas: profile.coreControlAreas,
    industryPhases: profile.phases,
  };
}

export const demoAssessmentAnswers: AssessmentAnswer[] = assessmentQuestions.map((question) => ({
  questionId: question.id,
  value: 3,
}));
