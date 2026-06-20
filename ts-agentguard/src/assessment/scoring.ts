import { assessmentQuestions, domainLabels } from "./questions";
import { AssessmentAnswer, AssessmentGrade, AssessmentReadiness, AssessmentRiskLevel, AssessmentResult, DomainScore, MaturityLevel, RecommendedActionGroup, PriorityRisk } from "./types";
export type { AssessmentResult } from "./types";

export function calculateAssessmentRiskLevel(score: number): AssessmentRiskLevel {
  if (score <= 49) return "CRITICAL RISK";
  if (score <= 69) return "HIGH RISK";
  if (score <= 84) return "MEDIUM RISK";
  return "LOW RISK";
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

const priorityRiskDescriptions: Record<DomainScore["domain"], string> = {
  FINANCIAL_ACTIONS: "AI 금전 실행 통제 체계가 부족합니다.",
  AI_RISK_MANAGEMENT: "AI 위험관리 체계가 미흡합니다.",
  PRIVACY_DATA_PROTECTION: "AI 데이터 보호 및 민감정보 통제 체계가 부족합니다.",
  MODEL_GOVERNANCE_HUMAN_OVERSIGHT: "고위험 AI 통제 및 Human Review 체계가 부족합니다.",
  STRATEGIC_GOVERNANCE: "전사 AI 거버넌스 체계가 부족합니다.",
};

const domainRecommendedActions: Record<DomainScore["domain"], string[]> = {
  FINANCIAL_ACTIONS: ["금전 실행 사전 승인 기준 수립", "거래 한도 및 예외 승인 절차 구축", "금전 실행 감사 로그 점검"],
  AI_RISK_MANAGEMENT: ["AI Risk Register 구축", "위험등급 체계 수립", "잔여위험 평가 수행"],
  PRIVACY_DATA_PROTECTION: ["AI 입력 금지 정보 기준 수립", "민감정보 유출 점검 절차 구축", "데이터 보호 사고 대응 절차 정비"],
  MODEL_GOVERNANCE_HUMAN_OVERSIGHT: ["Human Review 절차 구축", "고위험 AI 승인 체계 수립", "AI 결과 품질 및 오류 점검 루프 구축"],
  STRATEGIC_GOVERNANCE: ["AI Governance Committee 설립", "AI 정책 체계 구축", "경영진 AI 위험 보고 체계 수립"],
};

function lowestDomainScores(domainScores: DomainScore[]): DomainScore[] {
  return [...domainScores].sort((left, right) => left.score - right.score).slice(0, 3);
}

function buildPriorityRisks(domainScores: DomainScore[]): PriorityRisk[] {
  return lowestDomainScores(domainScores).map((domainScore) => ({
    domain: domainScore.domain,
    label: domainScore.label,
    score: domainScore.score,
    description: priorityRiskDescriptions[domainScore.domain],
  }));
}

function buildRecommendedActions(domainScores: DomainScore[]): RecommendedActionGroup[] {
  return lowestDomainScores(domainScores).map((domainScore) => ({
    domain: domainScore.domain,
    label: domainScore.label,
    actions: domainRecommendedActions[domainScore.domain],
  }));
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
    priorityRisks: buildPriorityRisks(domainScores),
    recommendedActions: buildRecommendedActions(domainScores),
    regulatoryReadiness: statusLabel(Math.round((domainScores[2].score + domainScores[4].score) / 2)),
    controlMaturity: statusLabel(Math.round((domainScores[0].score + domainScores[1].score + domainScores[3].score) / 3)),
    auditReadiness: statusLabel(Math.round((domainScores[3].score + domainScores[4].score) / 2)),
  };
}

export const demoAssessmentAnswers: AssessmentAnswer[] = assessmentQuestions.map((question) => ({
  questionId: question.id,
  value: 2,
}));
