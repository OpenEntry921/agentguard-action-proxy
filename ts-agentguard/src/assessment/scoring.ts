import { assessmentQuestions, domainLabels } from "./questions";
import { buildStandardsAlignment } from "./standards-mapping";
import { AssessmentAnswer, AssessmentAnswerLabel, AssessmentGrade, AssessmentReadiness, AssessmentRiskLevel, AssessmentResult, DomainExplanation, DomainScore, MaturityLevel, RecommendedActionGroup, PriorityRisk } from "./types";
export type { AssessmentResult } from "./types";

export function calculateAssessmentRiskLevel(score: number): AssessmentRiskLevel {
  if (score < 50) return "Critical Risk";
  if (score < 70) return "High Risk";
  if (score < 90) return "Medium Risk";
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
  FINANCIAL_ACTIONS: "AI 금전 실행 및 거래 관련 승인·한도·감사 통제가 부족합니다.",
  AI_RISK_MANAGEMENT: "AI 위험 식별, 위험등급 산정, 잔여위험 평가 체계가 미흡합니다.",
  PRIVACY_DATA_PROTECTION: "AI 데이터 보호 및 민감정보 처리 통제 체계가 부족합니다.",
  MODEL_GOVERNANCE_HUMAN_OVERSIGHT: "고위험 AI 통제 및 사람의 검토 절차가 부족합니다.",
  STRATEGIC_GOVERNANCE: "전사 AI 거버넌스 책임과 경영진 보고 체계가 충분히 정착되지 않았습니다.",
};

const maintenanceActions: Record<RecommendedActionGroup["label"], string[]> = {
  "30 Days": ["현재 AI 관리 기준 점검", "주요 AI 사용 현황 최신화", "정기 보고 일정 확인"],
  "90 Days": ["내부 정책 및 운영 기준 재검토", "감사 기록 보존 상태 점검", "임직원 교육 계획 갱신"],
  "180 Days": ["정기 재평가 수행", "규제 변화 반영 여부 점검", "AI 거버넌스 운영 성숙도 개선"],
};

const timeHorizonActions: Record<AssessmentRiskLevel, Record<RecommendedActionGroup["label"], string[]>> = {
  "Low Risk": maintenanceActions,
  "Medium Risk": {
    "30 Days": ["우선 관리 영역 개선 계획 수립", "담당자와 일정 확인", "필수 운영 기준 보완"],
    "90 Days": ["내부 정책 및 증빙 체계 보완", "주요 AI 사용 현황 점검", "임직원 교육 계획 갱신"],
    "180 Days": ["개선 결과 재점검", "정기 보고 체계 운영", "규제 변화 반영 여부 확인"],
  },
  "High Risk": {
    "30 Days": ["고위험 영역 개선 조치 착수", "경영진 보고 일정 확정", "핵심 승인 기준 보완"],
    "90 Days": ["위험관리 운영 기준 정비", "감사 기록 점검 체계 구축", "개인정보 보호 절차 보완"],
    "180 Days": ["개선 이행 결과 검토", "정기 재평가 수행", "AI 거버넌스 운영 수준 개선"],
  },
  "Critical Risk": {
    "30 Days": ["경영진 주도 즉시 개선 회의 개최", "우선 관리 위험 식별", "승인·감사·개인정보 보호 기준 긴급 보완"],
    "90 Days": ["핵심 통제 이행 상태 점검", "고위험 AI 사용 관리 체계 구축", "책임자 및 보고 체계 확정"],
    "180 Days": ["재평가 및 미해결 위험 보고", "규제 대응 수준 점검", "전사 AI 거버넌스 운영 개선"],
  },
};

const explanationFindings: Record<DomainScore["domain"], string[]> = {
  FINANCIAL_ACTIONS: ["금전 실행 사전 승인 부재", "거래 한도 및 예외 승인 기준 미흡", "금전 실행 감사 추적성 부족"],
  AI_RISK_MANAGEMENT: ["AI 위험 목록 부재", "위험등급 체계 미흡", "잔여위험 평가 부재"],
  PRIVACY_DATA_PROTECTION: ["민감정보 입력 기준 미흡", "고객정보 외부 전송 통제 부족", "데이터 보호 사고 대응 준비 부족"],
  MODEL_GOVERNANCE_HUMAN_OVERSIGHT: ["사람의 검토 절차 미흡", "고위험 AI 단독 의사결정 제한 부족", "AI 결과 품질 점검 루프 부족"],
  STRATEGIC_GOVERNANCE: ["경영진 승인 원칙 부재", "AI 역할과 의사결정 권한 불명확", "AI 거버넌스 개선 일정 미흡"],
};

function answerLabel(value: AssessmentAnswer["value"]): AssessmentAnswerLabel {
  if (value === 4) return "YES";
  if (value === 2) return "PARTIAL";
  if (value === 1) return "NOT SURE";
  return "NO";
}

function answerDisplay(label: AssessmentAnswerLabel): string {
  if (label === "YES") return "예";
  if (label === "PARTIAL") return "일부";
  if (label === "NOT SURE") return "확인 필요";
  return "아니오";
}

function answerImpact(label: AssessmentAnswerLabel): string {
  if (label === "YES") return "통제가 확인되어 감점 영향이 낮습니다.";
  if (label === "PARTIAL") return "부분 통제만 확인되어 보완 과제가 남습니다.";
  if (label === "NOT SURE") return "증빙 여부가 불명확하여 낮은 신뢰도로 반영됩니다.";
  return "통제가 확인되지 않아 주요 감점 요인입니다.";
}

function sortedDomainScores(domainScores: DomainScore[]): DomainScore[] {
  return [...domainScores].sort((left, right) => left.score - right.score || left.label.localeCompare(right.label));
}

function weakDomainScores(domainScores: DomainScore[], riskLevel: AssessmentRiskLevel): DomainScore[] {
  if (riskLevel === "Low Risk") return [];
  return sortedDomainScores(domainScores).filter((domainScore) => domainScore.score < 70 && domainScore.score < 90).slice(0, 3);
}

function buildPriorityRisks(domainScores: DomainScore[], riskLevel: AssessmentRiskLevel): PriorityRisk[] {
  return weakDomainScores(domainScores, riskLevel).map((domainScore) => ({ domain: domainScore.domain, label: domainScore.label, score: domainScore.score, description: priorityRiskDescriptions[domainScore.domain] }));
}

function buildRecommendedActions(riskLevel: AssessmentRiskLevel): RecommendedActionGroup[] {
  return (["30 Days", "90 Days", "180 Days"] as const).map((label) => ({ label, actions: timeHorizonActions[riskLevel][label] }));
}

function percentage(score: number): string {
  return `${Math.max(0, Math.min(100, Math.round(score)))}%`;
}

function buildExecutiveSummary(totalScore: number, riskLevel: AssessmentRiskLevel, priorityRisks: PriorityRisk[]): string {
  if (riskLevel === "Low Risk") {
    return "귀사는 현재 평가 범위 내에서 AI 거버넌스 체계가 전반적으로 잘 구축되어 있습니다. 중대한 고위험 영역은 확인되지 않았으며, 정기적인 점검과 지속적인 개선 활동을 유지하는 것이 권장됩니다.";
  }

  const weakAreas = priorityRisks.map((risk) => risk.label.replace(/^D\d+\s+/, ""));
  const weakAreaSentence = weakAreas.length > 0 ? ` 우선 관리 영역은 ${weakAreas.join(", ")}입니다.` : "";

  if (totalScore >= 70) {
    return `귀사는 AI 활용 기반을 갖추고 있으나 일부 거버넌스 통제와 증빙 체계의 보완이 필요합니다. 우선 관리 영역을 중심으로 개선 계획을 수립하면 규제 및 감사 대응 수준을 높일 수 있습니다.${weakAreaSentence}`;
  }

  if (totalScore >= 50) {
    return `귀사는 AI를 활용하고 있으나 주요 거버넌스 통제와 위험관리 체계가 충분히 정착되지 않았습니다. 고위험 영역을 중심으로 단기 개선 조치와 경영진 보고 체계 구축이 필요합니다.${weakAreaSentence}`;
  }

  return `귀사는 AI를 활용하고 있으나 현재 평가 범위에서 핵심 거버넌스 통제와 위험관리 체계가 상당히 부족한 상태입니다. AI 활용 확대 전에 우선 관리 위험을 식별하고, 승인·감사·개인정보 보호·위험관리 체계를 신속히 보완해야 합니다.${weakAreaSentence}`;
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
    const negativeAnswers = answerBreakdown.filter((item) => item.answer !== "YES").map((item) => `${item.displayId} ${answerDisplay(item.answer)}`).join(", ");

    return {
      domain: domainScore.domain,
      label: domainScore.label,
      score: domainScore.score,
      maxScore: domainScore.maxScore,
      answeredPoints,
      maxPoints,
      answerBreakdown,
      findings: explanationFindings[domainScore.domain],
      narrative: `${domainScore.label} 평가 결과는 ${domainScore.score}점입니다. ${negativeAnswers ? `보완 검토가 필요한 응답은 ${negativeAnswers}입니다.` : "모든 핵심 통제가 확인되었습니다."}`,
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
  const riskLevel = calculateAssessmentRiskLevel(totalScore);
  const priorityRisks = buildPriorityRisks(domainScores, riskLevel);
  const scoreFor = (domain: DomainScore["domain"]) => domainScores.find((score) => score.domain === domain)?.score ?? totalScore;

  return {
    totalScore,
    maxScore: 100,
    riskLevel,
    maturityLevel: calculateMaturityLevel(totalScore),
    governanceGrade: calculateAssessmentGrade(totalScore),
    aiReadiness: calculateReadiness(totalScore),
    domainScores,
    standardsAlignment: buildStandardsAlignment(domainScores),
    priorityRisks,
    explanations,
    recommendedActions: buildRecommendedActions(riskLevel),
    executiveSummary: buildExecutiveSummary(totalScore, riskLevel, priorityRisks),
    regulatoryReadiness: percentage(totalScore),
    controlMaturity: percentage((scoreFor("FINANCIAL_ACTIONS") + scoreFor("AI_RISK_MANAGEMENT") + scoreFor("MODEL_GOVERNANCE_HUMAN_OVERSIGHT")) / 3),
    auditReadiness: percentage((scoreFor("FINANCIAL_ACTIONS") + scoreFor("PRIVACY_DATA_PROTECTION") + scoreFor("MODEL_GOVERNANCE_HUMAN_OVERSIGHT") + scoreFor("STRATEGIC_GOVERNANCE")) / 4 + 5),
  };
}

export const demoAssessmentAnswers: AssessmentAnswer[] = assessmentQuestions.map((question) => ({ questionId: question.id, value: 2 }));
