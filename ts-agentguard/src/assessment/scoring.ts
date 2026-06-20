import { assessmentQuestions, domainLabels } from "./questions";
import { AssessmentAnswer, AssessmentGrade, AssessmentReadiness, AssessmentRiskLevel, AssessmentResult, DomainScore, MaturityLevel } from "./types";
export type { AssessmentResult } from "./types";

export function calculateAssessmentRiskLevel(score: number): AssessmentRiskLevel {
  if (score <= 49) return "Critical Risk";
  if (score <= 69) return "High Risk";
  if (score <= 84) return "Medium Risk";
  return "Low Risk";
}

function calculateAssessmentGrade(score: number): AssessmentGrade {
  if (score <= 49) return "D";
  if (score <= 69) return "C";
  if (score <= 84) return "B";
  if (score <= 94) return "A";
  return "A+";
}

function calculateReadiness(score: number): AssessmentReadiness {
  if (score <= 49) return "Not Ready";
  if (score <= 69) return "Partially Ready";
  if (score <= 84) return "Ready";
  return "Advanced";
}

function calculateMaturityLevel(score: number): MaturityLevel {
  if (score <= 49) return { level: 1, label: "Initial", displayName: "Level 1 Initial" };
  if (score <= 69) return { level: 2, label: "Developing", displayName: "Level 2 Developing" };
  if (score <= 84) return { level: 3, label: "Managed", displayName: "Level 3 Managed" };
  if (score <= 94) return { level: 4, label: "Governed", displayName: "Level 4 Governed" };
  return { level: 5, label: "Optimized", displayName: "Level 5 Optimized" };
}

function statusLabel(score: number): string {
  if (score <= 49) return "Needs Immediate Attention";
  if (score <= 69) return "Developing";
  if (score <= 84) return "Mostly Ready";
  return "Ready";
}

export function evaluateAssessment(answers: AssessmentAnswer[]): AssessmentResult {
  const answerValues = Object.fromEntries(answers.map((answer) => [answer.questionId, answer.value]));
  const domains = Object.keys(domainLabels) as DomainScore["domain"][];
  const domainScores = domains.map((domain) => {
    const questions = assessmentQuestions.filter((question) => question.domain === domain);
    const total = questions.reduce((sum, question) => sum + (answerValues[question.id] ?? 0), 0);
    return {
      domain,
      label: domainLabels[domain],
      score: Math.round((total / (questions.length * 4)) * 100),
      maxScore: 100 as const,
    };
  });
  const totalScore = Math.round(domainScores.reduce((sum, domainScore) => sum + domainScore.score, 0) / domainScores.length);

  return {
    totalScore,
    maxScore: 100,
    riskLevel: calculateAssessmentRiskLevel(totalScore),
    maturityLevel: calculateMaturityLevel(totalScore),
    governanceGrade: calculateAssessmentGrade(totalScore),
    aiReadiness: calculateReadiness(totalScore),
    domainScores,
    regulatoryReadiness: statusLabel(Math.round((domainScores[2].score + domainScores[4].score) / 2)),
    controlMaturity: statusLabel(Math.round((domainScores[0].score + domainScores[1].score + domainScores[3].score) / 3)),
    auditReadiness: statusLabel(Math.round((domainScores[3].score + domainScores[4].score) / 2)),
  };
}

export const demoAssessmentAnswers: AssessmentAnswer[] = assessmentQuestions.map((question) => ({
  questionId: question.id,
  value: 2,
}));
