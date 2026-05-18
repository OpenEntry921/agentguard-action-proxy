from agentguard.models import ActionRequest, RiskLevel


def _level(score: int) -> RiskLevel:
    if score >= 90:
        return RiskLevel.CRITICAL
    if score >= 70:
        return RiskLevel.HIGH
    if score >= 40:
        return RiskLevel.MEDIUM
    return RiskLevel.LOW


def score_risk(action: ActionRequest, repeated_attempts: int = 0, has_human_approval: bool = False) -> tuple[int, RiskLevel, list[str]]:
    score = 0
    reasons: list[str] = []

    if action.action_type in {"github.delete_repository", "aws.open_security_group"}:
        score += 65
        reasons.append("destructive_action")
    if "production" in action.target_resource.lower():
        score += 25
        reasons.append("production_resource")
    if action.action_type.endswith("share_external"):
        score += 15
        reasons.append("external_destination")
    if action.action_type == "github.change_branch_protection" or action.context.get("admin_level_action"):
        score += 20
        reasons.append("admin_privilege_change")
    if action.action_type == "github.export_secrets":
        score += 30
        reasons.append("secret_export")
    if action.action_type == "browser.update_ad_budget":
        before = float(action.parameters.get("current_budget", 0))
        after = float(action.parameters.get("new_budget", 0))
        if before > 0 and after / before >= 10:
            score += 65
            reasons.append("abnormal_budget_increase")
    if not has_human_approval:
        score += 10
        reasons.append("no_human_approval")
    if repeated_attempts > 0:
        score += min(15, repeated_attempts * 5)
        reasons.append("repeated_attempts")

    score = min(100, score)
    return score, _level(score), reasons
