import type { IndustryType } from "./industry-profiles";
import { industryProfiles } from "./industry-profiles";
import type { AssessmentGrade, AssessmentReadiness, AssessmentResult, DomainScore } from "./types";

const businessImpactItems = [
  "비인가 Agent 실행",
  "감사 추적 불가",
  "민감정보 유출",
  "승인 없는 자동 실행",
];

const phaseRecommendations = [
  { phase: "Phase 1", title: "AI Usage Policy" },
  { phase: "Phase 2", title: "Governance Design" },
  { phase: "Phase 3", title: "Policy Library" },
  { phase: "Phase 4", title: "AgentGuard Runtime Control" },
];

type IndustryAwareResult = AssessmentResult & {
  industry?: IndustryType;
  industryLabel?: string;
  industryCoreControlAreas?: string[];
  industryPhases?: Array<{ phase: string; title: string }>;
};

export function calculateAssessmentGrade(totalScore: number): AssessmentGrade {
  if (totalScore <= 20) return "D";
  if (totalScore <= 40) return "C";
  if (totalScore <= 60) return "B";
  if (totalScore <= 80) return "A";
  return "A+";
}

export function calculateReadinessIndicator(totalScore: number): AssessmentReadiness {
  if (totalScore <= 20) return "Not Ready";
  if (totalScore <= 60) return "Partially Ready";
  if (totalScore <= 80) return "Ready";
  return "Advanced";
}

export function priorityImprovementAreas(result: AssessmentResult): DomainScore[] {
  return [...result.domainScores]
    .sort((left, right) => left.score - right.score || left.label.localeCompare(right.label))
    .slice(0, 3);
}

export function executiveSummaryText(result: IndustryAwareResult): string {
  const priorityAreas = priorityImprovementAreas(result).map((area, index) => `${index + 1}. ${area.label}`).join("\n");
  const profile = result.industry ? industryProfiles[result.industry] : undefined;
  const industryLabel = result.industryLabel ?? profile?.label;
  const coreAreas = result.industryCoreControlAreas ?? profile?.coreControlAreas ?? [];
  const industryContext = industryLabel
    ? `\n\n귀사는 ${industryLabel} 기준으로 평가되었습니다.\n\n${industryLabel} 산업에서는\n${coreAreas.join("와 ")}이\n핵심 통제 영역입니다.`
    : "";

  return `Executive Summary\n\n귀사의 AI Governance 수준은\n${result.maturityLevel.displayName} 입니다.${industryContext}\n\n총점은 ${result.totalScore}/${result.maxScore}으로\n현재 AI 사용은 이루어지고 있으나\n통제 체계는 매우 부족한 상태입니다.\n\n우선 개선 영역은\n\n${priorityAreas}\n\n입니다.`;
}


export function businessImpactForExecutiveSummary(): string[] {
  return businessImpactItems;
}

export function openEntryPhaseRecommendations(industry?: IndustryType): Array<{ phase: string; title: string }> {
  return industry ? industryProfiles[industry].phases : phaseRecommendations;
}
