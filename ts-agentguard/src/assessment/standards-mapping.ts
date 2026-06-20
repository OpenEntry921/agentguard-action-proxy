import type { DomainScore, StandardsAlignment, StandardsAlignmentStatus } from "./types";

const standardsByDomain: Record<DomainScore["domain"], Omit<StandardsAlignment, "score" | "status" | "impact">> = {
  FINANCIAL_ACTIONS: {
    domain: "FINANCIAL_ACTIONS",
    label: "D04 Financial Actions",
    summary: "금전 실행 승인, 한도, 예외 처리 통제가 표준 관점에서 충분한지 확인합니다.",
    standards: [
      { framework: "ISO/IEC 42001", reference: "A.6 AI System Impact Assessment" },
      { framework: "NIST AI RMF", reference: "MANAGE" },
      { framework: "EU AI Act", reference: "Risk Management" },
      { framework: "금융위 AI 가이드라인", reference: "내부통제" },
    ],
  },
  AI_RISK_MANAGEMENT: {
    domain: "AI_RISK_MANAGEMENT",
    label: "D08 AI Risk Management",
    summary: "AI 위험 식별, 등급화, 잔여위험 관리 체계가 표준 요구와 연결됩니다.",
    standards: [
      { framework: "ISO/IEC 42001", reference: "A.5 AI Risk Management" },
      { framework: "NIST AI RMF", reference: "MAP / MEASURE / MANAGE" },
      { framework: "EU AI Act", reference: "Risk Management System" },
      { framework: "금융위 AI 가이드라인", reference: "위험관리" },
    ],
  },
  PRIVACY_DATA_PROTECTION: {
    domain: "PRIVACY_DATA_PROTECTION",
    label: "D13 Privacy & Data Protection",
    summary: "개인정보와 민감정보 처리 통제가 데이터 거버넌스 기준과 연결됩니다.",
    standards: [
      { framework: "ISO/IEC 42001", reference: "A.7 Data for AI Systems" },
      { framework: "NIST AI RMF", reference: "MAP / MEASURE" },
      { framework: "EU AI Act", reference: "Data Governance" },
      { framework: "금융위 AI 가이드라인", reference: "정보보호" },
    ],
  },
  MODEL_GOVERNANCE_HUMAN_OVERSIGHT: {
    domain: "MODEL_GOVERNANCE_HUMAN_OVERSIGHT",
    label: "D17 Human Oversight",
    summary: "사람의 검토와 고위험 AI 의사결정 통제가 핵심 표준 영향 영역입니다.",
    standards: [
      { framework: "ISO/IEC 42001", reference: "A.8 AI Lifecycle" },
      { framework: "NIST AI RMF", reference: "MANAGE 2.3" },
      { framework: "EU AI Act", reference: "Human Oversight" },
      { framework: "금융위 AI 가이드라인", reference: "거버넌스" },
    ],
  },
  STRATEGIC_GOVERNANCE: {
    domain: "STRATEGIC_GOVERNANCE",
    label: "D25 Strategic Governance",
    summary: "경영진 책임, 정책 승인, 보고 체계가 전사 거버넌스 기준과 연결됩니다.",
    standards: [
      { framework: "ISO/IEC 42001", reference: "A.3 Policies for AI" },
      { framework: "NIST AI RMF", reference: "GOVERN" },
      { framework: "EU AI Act", reference: "Governance & Accountability" },
      { framework: "금융위 AI 가이드라인", reference: "거버넌스" },
    ],
  },
};

export function standardsStatusForScore(score: number): StandardsAlignmentStatus {
  if (score >= 90) return "GREEN";
  if (score >= 70) return "YELLOW";
  return "RED";
}

function standardsImpactForStatus(status: StandardsAlignmentStatus): StandardsAlignment["impact"] {
  if (status === "GREEN") return "낮음";
  if (status === "YELLOW") return "중간";
  return "높음";
}

export function buildStandardsAlignment(domainScores: DomainScore[]): StandardsAlignment[] {
  return domainScores.map((domainScore) => {
    const status = standardsStatusForScore(domainScore.score);
    return {
      ...standardsByDomain[domainScore.domain],
      label: domainScore.label,
      score: domainScore.score,
      status,
      impact: standardsImpactForStatus(status),
    };
  });
}
