from agentguard.models import ActionRequest, Decision


def evaluate_policy(action: ActionRequest) -> tuple[Decision, list[str], str]:
    matched: list[str] = []

    if action.action_type == "github.delete_repository" and "production" in action.target_resource.lower():
        matched.append("deny_production_repository_delete")
        return Decision.DENY, matched, "Deleting a production repository is blocked by policy."

    if action.action_type == "github.change_branch_protection":
        matched.append("review_branch_protection_change")
        return Decision.REVIEW_REQUIRED, matched, "Branch protection changes require human approval."

    if action.action_type == "github.read_token_attempt":
        matched.append("deny_credential_access_attempt")
        return Decision.DENY, matched, "Credential access attempt is denied."

    if action.action_type == "github.export_secrets":
        if action.context.get("prompt_injection_detected") or action.context.get("tool_poisoning_detected"):
            matched.append("deny_secret_export_under_compromise_signal")
            return Decision.DENY, matched, "Secret export is denied when compromise signals are detected."
        matched.append("deny_or_review_secret_export")
        return Decision.REVIEW_REQUIRED, matched, "Secret export requires security review."

    if action.action_type == "github.modify_ci_workflow":
        matched.append("review_or_deny_cicd_tampering")
        return Decision.REVIEW_REQUIRED, matched, "CI/CD workflow modifications require security review."

    if action.action_type == "automation.mass_action_abuse":
        matched.append("review_or_deny_mass_automation")
        return Decision.REVIEW_REQUIRED, matched, "Mass automation actions require human approval."

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
