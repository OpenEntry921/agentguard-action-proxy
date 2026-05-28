from dataclasses import dataclass
from enum import Enum
from typing import Dict


class PolicyDecision(str, Enum):
    ALLOW = "ALLOW"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    DENY = "DENY"


@dataclass(frozen=True)
class PolicyEvaluationResult:
    action: str
    decision: PolicyDecision
    reason: str
    policy_version: str = "v1"


ACTION_DECISION_MAP: Dict[str, PolicyDecision] = {
    "create_branch": PolicyDecision.ALLOW,
    "create_pr": PolicyDecision.ALLOW,
    "modify_docs": PolicyDecision.ALLOW,
    "modify_workflow": PolicyDecision.REVIEW_REQUIRED,
    "modify_security_config": PolicyDecision.REVIEW_REQUIRED,
    "modify_production_code": PolicyDecision.REVIEW_REQUIRED,
    "delete_repo": PolicyDecision.DENY,
    "disable_branch_protection": PolicyDecision.DENY,
    "export_secrets": PolicyDecision.DENY,
}


def evaluate_github_action(action: str) -> PolicyEvaluationResult:
    decision = ACTION_DECISION_MAP.get(action, PolicyDecision.REVIEW_REQUIRED)
    if decision == PolicyDecision.ALLOW:
        reason = "policy_allowlist"
    elif decision == PolicyDecision.REVIEW_REQUIRED:
        reason = "human_approval_required"
    else:
        reason = "high_risk_action_denied"
    return PolicyEvaluationResult(action=action, decision=decision, reason=reason)
