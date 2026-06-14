import { ActionRequest, Decision } from "./models";
import {
  GOLD_ALLOWED_CURRENCY,
  GOLD_TARGET_PREFIX,
  getGoldActionDetails,
  isBuyGoldAction,
} from "./gold";

export interface PolicyEvaluation {
  decision: Decision;
  matchedPolicies: string[];
  reason: string;
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

export function evaluatePolicy(action: ActionRequest): PolicyEvaluation {
  const matchedPolicies: string[] = [];

  if (isBuyGoldAction(action)) {
    const { currency, goldAmountGrams } = getGoldActionDetails(action);
    if (currency !== GOLD_ALLOWED_CURRENCY) {
      matchedPolicies.push("deny_gold_currency_not_allowed");
      return {
        decision: Decision.DENY,
        matchedPolicies,
        reason: "Gold purchases are only allowed with XRP.",
      };
    }
    if (!action.target_resource.startsWith(GOLD_TARGET_PREFIX)) {
      matchedPolicies.push("deny_gold_target_not_allowed");
      return {
        decision: Decision.DENY,
        matchedPolicies,
        reason: "Gold purchases are only allowed for gold:vault_* targets.",
      };
    }
    if (goldAmountGrams > 1000) {
      matchedPolicies.push("deny_gold_amount_over_1000g");
      return {
        decision: Decision.DENY,
        matchedPolicies,
        reason: "Gold purchases over 1000g are denied.",
      };
    }
    if (goldAmountGrams > 100) {
      matchedPolicies.push("review_gold_amount_101_to_1000g");
      return {
        decision: Decision.REVIEW_REQUIRED,
        matchedPolicies,
        reason: "Gold purchases from 101g to 1000g require human review.",
      };
    }
    matchedPolicies.push("allow_gold_amount_up_to_100g");
    return {
      decision: Decision.ALLOW,
      matchedPolicies,
      reason: "Gold purchases up to 100g are allowed.",
    };
  }

  if (action.action_type === "github.delete_repository" && action.target_resource.toLowerCase().includes("production")) {
    matchedPolicies.push("deny_production_repository_delete");
    return {
      decision: Decision.DENY,
      matchedPolicies,
      reason: "Deleting a production repository is blocked by policy.",
    };
  }

  if (action.action_type === "github.change_branch_protection") {
    matchedPolicies.push("review_branch_protection_change");
    return {
      decision: Decision.REVIEW_REQUIRED,
      matchedPolicies,
      reason: "Branch protection changes require human approval.",
    };
  }

  if (action.action_type === "github.read_token_attempt") {
    matchedPolicies.push("deny_credential_access_attempt");
    return {
      decision: Decision.DENY,
      matchedPolicies,
      reason: "Credential access attempt is denied.",
    };
  }

  if (action.action_type === "github.export_secrets") {
    if (action.context.prompt_injection_detected || action.context.tool_poisoning_detected) {
      matchedPolicies.push("deny_secret_export_under_compromise_signal");
      return {
        decision: Decision.DENY,
        matchedPolicies,
        reason: "Secret export is denied when compromise signals are detected.",
      };
    }
    matchedPolicies.push("deny_or_review_secret_export");
    return {
      decision: Decision.REVIEW_REQUIRED,
      matchedPolicies,
      reason: "Secret export requires security review.",
    };
  }

  if (action.action_type === "github.modify_ci_workflow") {
    matchedPolicies.push("review_or_deny_cicd_tampering");
    return {
      decision: Decision.REVIEW_REQUIRED,
      matchedPolicies,
      reason: "CI/CD workflow modifications require security review.",
    };
  }

  if (action.action_type === "automation.mass_action_abuse") {
    matchedPolicies.push("review_or_deny_mass_automation");
    return {
      decision: Decision.REVIEW_REQUIRED,
      matchedPolicies,
      reason: "Mass automation actions require human approval.",
    };
  }

  if (action.action_type === "github.get_repository_status") {
    matchedPolicies.push("allow_readonly_status");
    return {
      decision: Decision.ALLOW,
      matchedPolicies,
      reason: "Read-only status lookup is allowed.",
    };
  }

  if (action.action_type === "browser.update_ad_budget") {
    const before = numberParameter(action.parameters.current_budget);
    const after = numberParameter(action.parameters.new_budget);
    if (before > 0 && after / before >= 10) {
      matchedPolicies.push("review_large_budget_change");
      return {
        decision: Decision.REVIEW_REQUIRED,
        matchedPolicies,
        reason: "Budget increase >=10x requires approval.",
      };
    }
  }

  if (action.action_type.endsWith(".share_external")) {
    matchedPolicies.push("review_external_sharing");
    return {
      decision: Decision.REVIEW_REQUIRED,
      matchedPolicies,
      reason: "External sharing requires approval.",
    };
  }

  if (action.context.admin_level_action === true) {
    matchedPolicies.push("review_admin_level_action");
    return {
      decision: Decision.REVIEW_REQUIRED,
      matchedPolicies,
      reason: "Admin-level actions require approval.",
    };
  }

  matchedPolicies.push("default_allow");
  return {
    decision: Decision.ALLOW,
    matchedPolicies,
    reason: "No blocking policy matched.",
  };
}
