import { ActionRequest, RiskLevel } from "./models";
import { getGoldActionDetails, isBuyGoldAction } from "./gold";

export interface RiskScore {
  score: number;
  level: RiskLevel;
  factors: string[];
}

function level(score: number): RiskLevel {
  if (score >= 90) {
    return RiskLevel.CRITICAL;
  }
  if (score >= 70) {
    return RiskLevel.HIGH;
  }
  if (score >= 40) {
    return RiskLevel.MEDIUM;
  }
  return RiskLevel.LOW;
}

function numberParameter(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return Number(value);
  }
  return 0;
}

export function scoreRisk(action: ActionRequest, repeatedAttempts = 0, hasHumanApproval = false): RiskScore {
  let score = 0;
  const factors: string[] = [];

  if (isBuyGoldAction(action)) {
    const { goldAmountGrams } = getGoldActionDetails(action);
    if (goldAmountGrams > 1000) {
      return { score: 95, level: RiskLevel.CRITICAL, factors: ["gold_amount_over_limit", "gold_trade_denied"] };
    }
    if (goldAmountGrams > 100) {
      return { score: 60, level: RiskLevel.MEDIUM, factors: ["gold_amount_requires_review"] };
    }
    return { score: 20, level: RiskLevel.LOW, factors: ["gold_amount_low_risk"] };
  }

  if (["github.delete_repository", "aws.open_security_group"].includes(action.action_type)) {
    score += 65;
    factors.push("destructive_action");
  }

  if (action.action_type === "github.read_token_attempt") {
    score += 80;
    factors.push("credential_access_attempt", "prompt_injection_detected", "tool_poisoning_detected");
  }

  if (action.action_type === "github.modify_ci_workflow") {
    score += 75;
    factors.push("cicd_tampering_attempt", "prompt_injection_detected", "tool_poisoning_detected");
  }

  if (action.action_type === "github.export_secrets") {
    score += 85;
    factors.push("secret_exfiltration_attempt", "secret_export", "prompt_injection_detected", "tool_poisoning_detected");
  }

  if (action.action_type === "automation.mass_action_abuse") {
    score += 65;
    factors.push("destructive_automation", "prompt_injection_detected", "tool_poisoning_detected");
  }

  if (action.target_resource.toLowerCase().includes("production")) {
    score += 25;
    factors.push("production_resource");
  }

  if (action.action_type.endsWith("share_external")) {
    score += 15;
    factors.push("external_destination");
  }

  if (action.action_type === "github.change_branch_protection" || action.context.admin_level_action) {
    score += 20;
    factors.push("admin_privilege_change");
  }

  if (action.action_type === "browser.update_ad_budget") {
    const before = numberParameter(action.parameters.current_budget);
    const after = numberParameter(action.parameters.new_budget);
    if (before > 0 && after / before >= 10) {
      score += 65;
      factors.push("abnormal_budget_increase");
    }
  }

  if (!hasHumanApproval) {
    score += 10;
    factors.push("no_human_approval");
  }

  if (repeatedAttempts > 0) {
    score += Math.min(15, repeatedAttempts * 5);
    factors.push("repeated_attempts");
  }

  const cappedScore = Math.min(100, score);
  return { score: cappedScore, level: level(cappedScore), factors };
}
