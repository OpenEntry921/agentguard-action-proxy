import { assessmentQuestions } from "./questions";
import { AssessmentAnswer, AssessmentResult, AssessmentRiskLevel, DomainScore, MaturityLevel } from "./types";

const maturityLevels: Array<{ min: number; max: number; value: MaturityLevel }> = [
  { min: 0, max: 20, value: { level: 1, label: "Ad-hoc", displayName: "Level 1: Ad-hoc" } },
  { min: 21, max: 40, value: { level: 2, label: "Controlled", displayName: "Level 2: Controlled" } },
  { min: 41, max: 60, value: { level: 3, label: "Managed", displayName: "Level 3: Managed" } },
  { min: 61, max: 80, value: { level: 4, label: "Governed", displayName: "Level 4: Governed" } },
  { min: 81, max: 100, value: { level: 5, label: "Autonomous Governance", displayName: "Level 5: Autonomous Governance" } },
];

const riskLevels: Array<{ min: number; max: number; value: AssessmentRiskLevel }> = [
  { min: 0, max: 20, value: "Critical Risk" },
  { min: 21, max: 40, value: "High Risk" },
  { min: 41, max: 60, value: "Medium Risk" },
  { min: 61, max: 80, value: "Low Risk" },
  { min: 81, max: 100, value: "Optimized" },
];

export function calculateMaturityLevel(totalScore: number): MaturityLevel {
  return maturityLevels.find((entry) => totalScore >= entry.min && totalScore <= entry.max)?.value ?? maturityLevels[0].value;
}

export function calculateAssessmentRiskLevel(totalScore: number): AssessmentRiskLevel {
  return riskLevels.find((entry) => totalScore >= entry.min && totalScore <= entry.max)?.value ?? "Critical Risk";
}

export function evaluateAssessment(answers: AssessmentAnswer[]): AssessmentResult {
  const answerValues = new Map(answers.map((answer) => [answer.questionId, answer.value]));
  const domainScores: DomainScore[] = [];

  for (const question of assessmentQuestions) {
    if (!domainScores.some((score) => score.domain === question.domain)) {
      domainScores.push({ domain: question.domain, label: question.domainLabel, score: 0, maxScore: 20 });
    }

    const domainScore = domainScores.find((score) => score.domain === question.domain);
    if (domainScore) {
      domainScore.score += answerValues.get(question.id) ?? 0;
    }
  }

  const totalScore = domainScores.reduce((sum, domainScore) => sum + domainScore.score, 0);
  return {
    totalScore,
    maxScore: 100,
    riskLevel: calculateAssessmentRiskLevel(totalScore),
    maturityLevel: calculateMaturityLevel(totalScore),
    domainScores,
  };
}

export const demoAssessmentAnswers: AssessmentAnswer[] = [
  { questionId: "ai_usage_1", value: 3 },
  { questionId: "ai_usage_2", value: 3 },
  { questionId: "ai_usage_3", value: 3 },
  { questionId: "ai_usage_4", value: 3 },
  { questionId: "data_protection_1", value: 3 },
  { questionId: "data_protection_2", value: 1 },
  { questionId: "data_protection_3", value: 1 },
  { questionId: "data_protection_4", value: 3 },
  { questionId: "access_control_1", value: 1 },
  { questionId: "access_control_2", value: 1 },
  { questionId: "access_control_3", value: 3 },
  { questionId: "access_control_4", value: 1 },
  { questionId: "audit_traceability_1", value: 1 },
  { questionId: "audit_traceability_2", value: 1 },
  { questionId: "audit_traceability_3", value: 1 },
  { questionId: "audit_traceability_4", value: 3 },
  { questionId: "agent_risk_1", value: 1 },
  { questionId: "agent_risk_2", value: 1 },
  { questionId: "agent_risk_3", value: 3 },
  { questionId: "agent_risk_4", value: 1 },
];
