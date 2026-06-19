import { AssessmentResult } from "./types";

export function topRisksFor(result: AssessmentResult): string[] {
  const risks = [
    "No formal AI usage policy",
    "Sensitive data may be entered into external AI tools",
    "No runtime control before AI agent execution",
    "Insufficient audit trail for AI-assisted decisions",
    "High-risk agent actions may occur without human approval",
  ];

  if (result.totalScore > 60) {
    return risks.slice(2, 5);
  }

  return risks.slice(0, 3);
}

export function recommendationsFor(result: AssessmentResult): string[] {
  const recommendations = [
    "Establish AI usage policy",
    "Define sensitive data handling rules",
    "Implement approval workflow for high-risk AI actions",
    "Prepare AgentGuard runtime control PoC",
  ];

  if (result.totalScore > 80) {
    return [
      "Extend runtime governance coverage to more agent workflows",
      "Continuously monitor policy effectiveness",
      "Benchmark autonomous governance readiness against industry peers",
      "Prepare AgentGuard runtime control PoC for production-grade enforcement",
    ];
  }

  return recommendations;
}
