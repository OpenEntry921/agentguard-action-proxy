import type { IndustryType } from "./industry-profiles";
import type { AssessmentResult, DomainScore } from "./types";

export type ImpactScore = "Low" | "Medium" | "High" | "Critical";

export interface BusinessScenario {
  industry: IndustryType;
  scenario: string;
  triggerDomain: DomainScore["domain"];
  impacts: string[];
  likelihood: ImpactScore;
  severity: ImpactScore;
  impactScore: ImpactScore;
  potentialImpact: string[];
  executiveScenario: string;
  executiveImpact: string[];
}

type ScenarioRule = Omit<BusinessScenario, "likelihood" | "severity" | "impactScore"> & {
  threshold: number;
};

const scenarioLibrary: Record<IndustryType, ScenarioRule> = {
  HEALTHCARE: {
    industry: "HEALTHCARE",
    scenario: "환자정보가 외부 AI에 입력됨",
    triggerDomain: "DATA_PROTECTION",
    threshold: 3,
    impacts: ["개인정보 유출", "규제 위반", "평판 손상"],
    potentialImpact: ["규제 조사 가능성", "고객 신뢰도 하락", "데이터 유출 위험"],
    executiveScenario: "환자정보가 외부 AI에 입력될 가능성 존재",
    executiveImpact: ["개인정보보호법 위반", "감사 리스크 증가"],
  },
  FINANCIAL: {
    industry: "FINANCIAL",
    scenario: "AI Agent가 승인 없이 송금 실행",
    triggerDomain: "AGENT_RISK",
    threshold: 3,
    impacts: ["금전 손실", "감사 이슈", "규제 리스크"],
    potentialImpact: ["금전 손실", "규제 감사", "거래 정지"],
    executiveScenario: "AI Agent가 승인 없이 송금을 실행할 가능성 존재",
    executiveImpact: ["금전 손실 가능성", "규제 감사 및 거래 통제 리스크 증가"],
  },
  MANUFACTURING: {
    industry: "MANUFACTURING",
    scenario: "생산설비 변경 명령 자동 실행",
    triggerDomain: "ACCESS_CONTROL",
    threshold: 3,
    impacts: ["생산 중단", "안전 사고"],
    potentialImpact: ["생산 라인 중단", "작업자 안전 사고", "품질 및 납기 차질"],
    executiveScenario: "생산설비 변경 명령이 충분한 승인 없이 자동 실행될 가능성 존재",
    executiveImpact: ["생산 중단 리스크", "안전 사고 및 운영 감사 리스크 증가"],
  },
  PUBLIC: {
    industry: "PUBLIC",
    scenario: "행정 데이터 오사용",
    triggerDomain: "AUDIT_TRACEABILITY",
    threshold: 3,
    impacts: ["감사 지적", "대민 신뢰 하락"],
    potentialImpact: ["감사 지적 가능성", "민원 및 대민 신뢰도 하락", "행정 투명성 논란"],
    executiveScenario: "행정 데이터가 목적과 다르게 사용될 가능성 존재",
    executiveImpact: ["감사 지적 증가", "대민 신뢰 하락"],
  },
  TECHNOLOGY: {
    industry: "TECHNOLOGY",
    scenario: "GitHub 코드 자동 반영",
    triggerDomain: "AGENT_RISK",
    threshold: 3,
    impacts: ["서비스 장애", "보안 사고"],
    potentialImpact: ["서비스 장애", "보안 취약점 배포", "고객 영향 및 복구 비용 증가"],
    executiveScenario: "GitHub 코드가 충분한 검토 없이 자동 반영될 가능성 존재",
    executiveImpact: ["서비스 장애 가능성", "보안 사고 및 고객 영향 증가"],
  },
};

function scoreForDomain(result: AssessmentResult, domain: DomainScore["domain"]): number {
  return result.domainScores.find((domainScore) => domainScore.domain === domain)?.score ?? 0;
}

function impactScoreFor(score: number): ImpactScore {
  if (score <= 3) return "Critical";
  if (score <= 6) return "High";
  if (score <= 10) return "Medium";
  return "Low";
}

function likelihoodFor(score: number): ImpactScore {
  if (score <= 3) return "High";
  if (score <= 6) return "Medium";
  return "Low";
}

export function businessScenarioFor(result: AssessmentResult & { industry: IndustryType }): BusinessScenario {
  const rule = scenarioLibrary[result.industry];
  const domainScore = scoreForDomain(result, rule.triggerDomain);
  const weakEnoughToTrigger = domainScore <= rule.threshold;

  return {
    ...rule,
    likelihood: weakEnoughToTrigger ? likelihoodFor(domainScore) : "Low",
    severity: impactScoreFor(domainScore),
    impactScore: impactScoreFor(domainScore),
  };
}

export function scenarioLibraryFor(industry: IndustryType): ScenarioRule {
  return scenarioLibrary[industry];
}
