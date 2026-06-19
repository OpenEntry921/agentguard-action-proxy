import type { IndustryType } from "./industry-profiles";
import { industryProfiles } from "./industry-profiles";
import type { AssessmentResult, DomainScore } from "./types";

export interface Recommendation {
  priority: number;
  title: string;
  reason: string;
  expectedOutcome: string;
}

export interface RoadmapItem {
  day: "30 Days" | "60 Days" | "90 Days";
  title: string;
}

const domainRecommendations: Record<DomainScore["domain"], Array<Omit<Recommendation, "priority">>> = {
  AI_USAGE: [
    { title: "AI Usage Policy", reason: "AI 사용 기준이 불명확하면 Shadow AI와 부적절한 도구 사용이 빠르게 확산됩니다.", expectedOutcome: "허용된 AI 사용 범위와 책임 기준 확보" },
    { title: "Shadow AI Identification", reason: "승인되지 않은 AI 사용은 데이터 유출과 규제 대응 공백으로 이어질 수 있습니다.", expectedOutcome: "조직 내 비인가 AI 사용 현황 가시화" },
    { title: "AI Usage Approval Process", reason: "고위험 AI 활용은 사전 승인 없이 확대될 경우 운영 리스크가 누적됩니다.", expectedOutcome: "AI 사용 요청에 대한 일관된 검토 및 승인 체계 확보" },
  ],
  DATA_PROTECTION: [
    { title: "Sensitive Data Classification", reason: "민감정보 분류가 없으면 외부 AI 도구 입력 통제가 작동하기 어렵습니다.", expectedOutcome: "데이터 유출 위험 감소" },
    { title: "Data Input Policy", reason: "AI 프롬프트 입력 기준이 없으면 개인정보와 영업비밀이 외부로 전달될 수 있습니다.", expectedOutcome: "AI 입력 데이터에 대한 명확한 허용·금지 기준 확보" },
    { title: "External AI Data Control", reason: "외부 AI 사용 통제가 약하면 데이터 보관 위치와 재사용 여부를 검증하기 어렵습니다.", expectedOutcome: "외부 AI 사용 시 민감정보 노출 가능성 축소" },
  ],
  ACCESS_CONTROL: [
    { title: "Access Permission Model", reason: "권한 모델이 불명확하면 AI와 사용자가 필요한 범위를 초과해 시스템에 접근할 수 있습니다.", expectedOutcome: "역할 기반 접근 기준 정립" },
    { title: "Least Privilege Enforcement", reason: "과도한 권한은 자동화된 작업의 피해 범위를 확대합니다.", expectedOutcome: "불필요한 권한 축소 및 오남용 가능성 감소" },
    { title: "Approval Governance", reason: "중요 작업에 승인 체계가 없으면 고위험 변경이 검토 없이 실행될 수 있습니다.", expectedOutcome: "고위험 작업에 대한 사전 통제 확보" },
  ],
  AUDIT_TRACEABILITY: [
    { title: "Audit Log Framework", reason: "감사 로그가 없으면 AI 사용과 결과의 책임 소재를 확인하기 어렵습니다.", expectedOutcome: "AI 의사결정과 실행 이력에 대한 추적성 확보" },
    { title: "Execution Traceability", reason: "실행 추적 체계가 약하면 사고 발생 시 원인 분석과 재현이 지연됩니다.", expectedOutcome: "문제 발생 시 신속한 조사와 대응 가능" },
    { title: "Log Retention Policy", reason: "보관 정책이 없으면 규제 대응과 내부 감사에 필요한 증적이 소실될 수 있습니다.", expectedOutcome: "감사와 규제 대응을 위한 증적 보존 기준 확보" },
  ],
  AGENT_RISK: [
    { title: "Agent Approval Workflow", reason: "비인가 Agent 행동은 직접적인 운영 리스크와 시스템 변경 리스크로 연결됩니다.", expectedOutcome: "Agent 행동에 대한 승인 통제 확보" },
    { title: "Runtime Monitoring", reason: "Agent 실행 중 모니터링이 없으면 의도하지 않은 작업을 조기에 탐지하기 어렵습니다.", expectedOutcome: "Agent 행동의 실시간 가시성 확보" },
    { title: "AgentGuard PoC", reason: "고위험 Agent 실행은 정책 기반 통제 가능성을 작은 범위에서 검증해야 합니다.", expectedOutcome: "Runtime Governance 적용 가능성 검증" },
  ],
};

const industryPriorityDomains: Record<IndustryType, DomainScore["domain"][]> = {
  TECHNOLOGY: ["AI_USAGE", "AGENT_RISK"],
  FINANCIAL: ["AGENT_RISK", "ACCESS_CONTROL"],
  HEALTHCARE: ["DATA_PROTECTION", "AUDIT_TRACEABILITY"],
  PUBLIC: ["AUDIT_TRACEABILITY"],
  MANUFACTURING: ["ACCESS_CONTROL"],
};

const industryReasons: Partial<Record<IndustryType, Partial<Record<DomainScore["domain"], string>>>> = {
  FINANCIAL: { AGENT_RISK: "금융산업에서는 비인가 Agent 행동이 직접적인 운영 리스크로 연결됩니다." },
  HEALTHCARE: { DATA_PROTECTION: "의료 데이터는 높은 개인정보 민감도를 가집니다." },
  PUBLIC: { AUDIT_TRACEABILITY: "공공부문은 투명성과 감사 가능성이 신뢰 확보의 핵심입니다." },
  MANUFACTURING: { ACCESS_CONTROL: "제조 환경에서는 권한 없는 변경이 생산 운영과 품질 리스크로 이어질 수 있습니다." },
  TECHNOLOGY: { AI_USAGE: "기술 조직은 AI 도입 속도가 빨라 사용 정책 부재 시 Shadow AI가 빠르게 확산됩니다.", AGENT_RISK: "기술 조직의 Agent는 개발·운영 시스템에 접근할 가능성이 높아 실행 통제가 중요합니다." },
};

export function topWeaknesses(result: AssessmentResult): DomainScore[] {
  return [...result.domainScores].sort((left, right) => left.score - right.score || left.label.localeCompare(right.label)).slice(0, 3);
}

export function generateRecommendations(result: AssessmentResult & { industry?: IndustryType }): Recommendation[] {
  if (result.totalScore >= 90) {
    return [{ priority: 1, title: "Continuous Improvement Program", reason: "현재 주요 Governance Risk는 식별되지 않았습니다. 높은 성숙도를 유지하려면 정기 점검과 개선 루프가 필요합니다.", expectedOutcome: "AI Governance 성숙도 유지 및 신규 리스크 조기 탐지" }];
  }

  const industry = result.industry;
  const priorityDomains = industry ? industryPriorityDomains[industry] : [];
  const weaknessDomains = topWeaknesses(result).map((score) => score.domain);
  const orderedDomains = [...new Set([...weaknessDomains.filter((domain) => priorityDomains.includes(domain)), ...weaknessDomains, ...priorityDomains])];

  return orderedDomains.flatMap((domain) => domainRecommendations[domain].map((item) => ({ ...item, reason: industryReasons[industry as IndustryType]?.[domain] ?? item.reason })))
    .slice(0, 5)
    .map((item, index) => ({ ...item, priority: index + 1 }));
}

export function quickWinsFor(result: AssessmentResult & { industry?: IndustryType }): string[] {
  if (result.totalScore >= 90) return ["분기별 Governance 리뷰 일정 수립", "신규 AI 사용 사례 등록 기준 점검", "정책 예외 승인 이력 샘플링"];
  const quickWinByDomain: Record<DomainScore["domain"], string> = {
    AI_USAGE: "AI 사용 정책 문서 작성",
    DATA_PROTECTION: "민감정보 입력 가이드 배포",
    ACCESS_CONTROL: "승인 절차 정의",
    AUDIT_TRACEABILITY: "감사 로그 보관기간 정의",
    AGENT_RISK: "Agent 실행 승인 기준 초안 작성",
  };
  return topWeaknesses(result).map((score) => quickWinByDomain[score.domain]);
}

export function roadmapFor(result: AssessmentResult & { industry?: IndustryType }): RoadmapItem[] {
  if (result.totalScore >= 90) return [
    { day: "30 Days", title: "Governance Health Check" },
    { day: "60 Days", title: "Control Effectiveness Review" },
    { day: "90 Days", title: "Continuous Improvement Program" },
  ];
  const recommendations = generateRecommendations(result);
  return [
    { day: "30 Days", title: recommendations[0]?.title ?? "AI Usage Policy" },
    { day: "60 Days", title: recommendations[1]?.title ?? "Approval Workflow" },
    { day: "90 Days", title: recommendations[2]?.title ?? industryProfiles[result.industry ?? "TECHNOLOGY"].phases.at(-1)?.title ?? "Runtime Governance" },
  ];
}

export function businessImpactFor(result: AssessmentResult): string[] {
  if (result.totalScore >= 90) return ["현재 주요 Governance Risk 없음"];
  return topWeaknesses(result).map((score) => `${score.label} 통제 미흡으로 운영·규제 리스크가 증가할 수 있습니다.`);
}
