import type { IndustryType } from "./industry-profiles";
import { industryProfiles } from "./industry-profiles";
import { businessImpactFor, topWeaknesses } from "./recommendation-engine";
import type { AssessmentGrade, AssessmentReadiness, AssessmentResult, DomainScore } from "./types";

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
  const priorityAreas = topWeaknesses(result).map((area, index) => `${index + 1}. ${area.label}`).join("\n");
  const profile = result.industry ? industryProfiles[result.industry] : undefined;
  const industryLabel = result.industryLabel ?? profile?.label;
  const coreAreas = result.industryCoreControlAreas ?? profile?.coreControlAreas ?? [];
  const industryContext = industryLabel
    ? `\n\n귀사는 ${industryLabel} 기준으로 평가되었습니다.\n\n${industryLabel} 산업에서는\n${coreAreas.join("와 ")}이\n핵심 통제 영역입니다.`
    : "";

  return `Executive Summary\n\n현재 수준:\n${result.maturityLevel.displayName}${industryContext}\n\n총점은 ${result.totalScore}/${result.maxScore}입니다.\n\n가장 취약한 영역:\n${priorityAreas}\n\n예상 우선 개선 기간:\n30~90일`;
}


export function businessImpactForExecutiveSummary(result?: AssessmentResult): string[] {
  return result ? businessImpactFor(result) : ["현재 주요 Governance Risk 없음"];
}

export function openEntryPhaseRecommendations(industry?: IndustryType): Array<{ phase: string; title: string }> {
  return industry ? industryProfiles[industry].phases : phaseRecommendations;
}
