from agentguard.models import ActionRequest, Decision


def evaluate_policy(action: ActionRequest) -> tuple[Decision, list[str], str]:
    matched: list[str] = []

    if action.action_type == "github.delete_repository" and "production" in action.target_resource.lower():
        matched.append("deny_production_repository_delete")
        return Decision.DENY, matched, "Deleting a production repository is blocked by policy."

    if action.action_type == "github.change_branch_protection":
        matched.append("review_branch_protection_change")
        return Decision.REVIEW_REQUIRED, matched, "Branch protection changes require human approval."

    if action.action_type == "github.export_secrets":
        matched.append("deny_or_review_secret_export")
        return Decision.REVIEW_REQUIRED, matched, "Secret export requires security review."

    if action.action_type == "github.get_repository_status":
        matched.append("allow_readonly_status")
        return Decision.ALLOW, matched, "Read-only status lookup is allowed."

    if action.action_type == "browser.update_ad_budget":
        before = float(action.parameters.get("current_budget", 0))
        after = float(action.parameters.get("new_budget", 0))
        if before > 0 and after / before >= 10:
            matched.append("review_large_budget_change")
            return Decision.REVIEW_REQUIRED, matched, "Budget increase >=10x requires approval."

    if action.action_type.endswith(".share_external"):
        matched.append("review_external_sharing")
        return Decision.REVIEW_REQUIRED, matched, "External sharing requires approval."

    if action.context.get("admin_level_action") is True:
        matched.append("review_admin_level_action")
        return Decision.REVIEW_REQUIRED, matched, "Admin-level actions require approval."

    matched.append("default_allow")
    return Decision.ALLOW, matched, "No blocking policy matched."
