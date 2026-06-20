import { assessmentQuestions, domainLabels } from "./questions";
import { AssessmentAnswer, AssessmentAnswerLabel, AssessmentGrade, AssessmentReadiness, AssessmentRiskLevel, AssessmentResult, DomainExplanation, DomainScore, MaturityLevel, RecommendedActionGroup, PriorityRisk } from "./types";
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

const priorityRiskDescriptions: Record<DomainScore["domain"], string> = {
  FINANCIAL_ACTIONS: "AI 금전 실행 통제 체계가 부족합니다.",
  AI_RISK_MANAGEMENT: "AI 위험관리 체계가 미흡합니다.",
  PRIVACY_DATA_PROTECTION: "AI 데이터 보호 및 민감정보 통제 체계가 부족합니다.",
  MODEL_GOVERNANCE_HUMAN_OVERSIGHT: "고위험 AI 통제 및 Human Review 체계가 부족합니다.",
  STRATEGIC_GOVERNANCE: "전사 AI 거버넌스 체계가 부족합니다.",
};

const timeHorizonActions: Record<DomainScore["domain"], Record<RecommendedActionGroup["label"], string[]>> = {
  FINANCIAL_ACTIONS: { "30 Days": ["금전 실행 사전 승인 기준 수립"], "90 Days": ["거래 한도 및 예외 승인 절차 구축"], "180 Days": ["금전 실행 감사 로그 정례 점검"] },
  AI_RISK_MANAGEMENT: { "30 Days": ["AI Risk Register 작성"], "90 Days": ["AI 위험등급 체계 수립"], "180 Days": ["잔여위험 정기 평가 프로세스 정착"] },
  PRIVACY_DATA_PROTECTION: { "30 Days": ["민감정보 처리 기준 수립"], "90 Days": ["민감정보 유출 점검 절차 구축"], "180 Days": ["데이터 보호 사고 대응 훈련 운영"] },
  MODEL_GOVERNANCE_HUMAN_OVERSIGHT: { "30 Days": ["Human Review 구축"], "90 Days": ["고위험 AI 승인체계 구축"], "180 Days": ["AI 결과 품질 및 오류 점검 루프 정착"] },
  STRATEGIC_GOVERNANCE: { "30 Days": ["경영진 AI 위험 보고 기준 수립"], "90 Days": ["AI 정책 체계 구축"], "180 Days": ["AI Governance Committee 운영"] },
};

const explanationFindings: Record<DomainScore["domain"], string[]> = {
  FINANCIAL_ACTIONS: ["금전 실행 사전 승인 부재", "거래 한도 및 예외 승인 기준 미흡", "금전 실행 감사 추적성 부족"],
  AI_RISK_MANAGEMENT: ["AI Risk Register 부재", "위험등급 체계 미흡", "잔여위험 평가 부재"],
  PRIVACY_DATA_PROTECTION: ["민감정보 입력 기준 미흡", "고객정보 외부 전송 통제 부족", "데이터 보호 사고 대응 준비 부족"],
  MODEL_GOVERNANCE_HUMAN_OVERSIGHT: ["Human Review 절차 미흡", "고위험 AI 단독 의사결정 제한 부족", "AI 결과 품질 점검 루프 부족"],
  STRATEGIC_GOVERNANCE: ["경영진 승인 원칙 부재", "AI 역할과 의사결정 권한 불명확", "AI 거버넌스 개선 일정 미흡"],
};

function answerLabel(value: AssessmentAnswer["value"]): AssessmentAnswerLabel {
  if (value === 4) return "YES";
  if (value === 2) return "PARTIAL";
  if (value === 1) return "NOT SURE";
  return "NO";
}

function answerImpact(label: AssessmentAnswerLabel): string {
  if (label === "YES") return "통제가 확인되어 감점 영향이 낮습니다.";
  if (label === "PARTIAL") return "부분 통제만 확인되어 보완 과제가 남습니다.";
  if (label === "NOT SURE") return "증빙 여부가 불명확하여 낮은 신뢰도로 반영됩니다.";
  return "통제가 확인되지 않아 주요 감점 요인입니다.";
}

function lowestDomainScores(domainScores: DomainScore[]): DomainScore[] {
  return [...domainScores].sort((left, right) => left.score - right.score || left.label.localeCompare(right.label)).slice(0, 3);
}

function buildPriorityRisks(domainScores: DomainScore[]): PriorityRisk[] {
  return lowestDomainScores(domainScores).map((domainScore) => ({ domain: domainScore.domain, label: domainScore.label, score: domainScore.score, description: priorityRiskDescriptions[domainScore.domain] }));
}

function buildRecommendedActions(domainScores: DomainScore[]): RecommendedActionGroup[] {
  const priorityDomains = lowestDomainScores(domainScores);
  return (["30 Days", "90 Days", "180 Days"] as const).map((label) => ({
    label,
    actions: [...new Set(priorityDomains.flatMap((domainScore) => timeHorizonActions[domainScore.domain][label]))].slice(0, 3),
  }));
}

function percentage(score: number): string {
  return `${Math.max(0, Math.min(100, Math.round(score)))}%`;
}

function buildExecutiveSummary(domainScores: DomainScore[]): string {
  const weakestLabels = lowestDomainScores(domainScores).map((domainScore) => domainScore.label.replace(/^D\d+\s+/, ""));
  return `귀사는 AI를 적극 활용하고 있으나 ${weakestLabels.slice(0, 2).join(" 및 ")} 통제가 상대적으로 부족합니다.\n\n단기적으로 ${weakestLabels.join(", ")} 개선이 필요합니다.`;
}

function buildExplanations(answerValues: Record<string, AssessmentAnswer["value"]>, domainScores: DomainScore[]): DomainExplanation[] {
  return domainScores.map((domainScore) => {
    const questions = assessmentQuestions.filter((question) => question.domain === domainScore.domain);
    const answeredPoints = questions.reduce((sum, question) => sum + (answerValues[question.id] ?? 0), 0);
    const maxPoints = questions.length * 4;
    const answerBreakdown = questions.map((question) => {
      const points = answerValues[question.id] ?? 0;
      const answer = answerLabel(points);
      return {
        questionId: question.id,
        displayId: question.displayId,
        title: question.title,
        answer,
        points,
        maxPoints: 4 as const,
        impact: answerImpact(answer),
      };
    });
    const negativeAnswers = answerBreakdown.filter((item) => item.answer !== "YES").map((item) => `${item.displayId} ${item.answer}`).join(", ");

    return {
      domain: domainScore.domain,
      label: domainScore.label,
      score: domainScore.score,
      maxScore: domainScore.maxScore,
      answeredPoints,
      maxPoints,
      answerBreakdown,
      findings: explanationFindings[domainScore.domain],
      narrative: `${domainScore.label} 점수는 ${answeredPoints}/${maxPoints} 응답 포인트를 100점 기준으로 환산한 ${domainScore.score}점입니다. ${negativeAnswers || "모든 핵심 통제가 확인되었습니다."}`,
    };
  });
}

export function evaluateAssessment(answers: AssessmentAnswer[]): AssessmentResult {
  const answerValues = Object.fromEntries(answers.map((answer) => [answer.questionId, answer.value]));
  const domains = Object.keys(domainLabels) as DomainScore["domain"][];
  const domainScores = domains.map((domain) => {
    const questions = assessmentQuestions.filter((question) => question.domain === domain);
    const total = questions.reduce((sum, question) => sum + (answerValues[question.id] ?? 0), 0);
    return { domain, label: domainLabels[domain], score: Math.round((total / (questions.length * 4)) * 100), maxScore: 100 as const };
  });
  const totalScore = Math.round(domainScores.reduce((sum, domainScore) => sum + domainScore.score, 0) / domainScores.length);
  const explanations = buildExplanations(answerValues, domainScores);
  const scoreFor = (domain: DomainScore["domain"]) => domainScores.find((score) => score.domain === domain)?.score ?? totalScore;

  return {
    totalScore,
    maxScore: 100,
    riskLevel: calculateAssessmentRiskLevel(totalScore),
    maturityLevel: calculateMaturityLevel(totalScore),
    governanceGrade: calculateAssessmentGrade(totalScore),
    aiReadiness: calculateReadiness(totalScore),
    domainScores,
    priorityRisks: buildPriorityRisks(domainScores),
    explanations,
    recommendedActions: buildRecommendedActions(domainScores),
    executiveSummary: buildExecutiveSummary(domainScores),
    regulatoryReadiness: percentage(totalScore),
    controlMaturity: percentage((scoreFor("FINANCIAL_ACTIONS") + scoreFor("AI_RISK_MANAGEMENT") + scoreFor("MODEL_GOVERNANCE_HUMAN_OVERSIGHT")) / 3),
    auditReadiness: percentage((scoreFor("FINANCIAL_ACTIONS") + scoreFor("PRIVACY_DATA_PROTECTION") + scoreFor("MODEL_GOVERNANCE_HUMAN_OVERSIGHT") + scoreFor("STRATEGIC_GOVERNANCE")) / 4 + 5),
  };
}

export const demoAssessmentAnswers: AssessmentAnswer[] = assessmentQuestions.map((question) => ({ questionId: question.id, value: 2 }));
