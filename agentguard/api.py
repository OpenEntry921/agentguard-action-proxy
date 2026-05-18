from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse

from agentguard.approval import ApprovalStore
from agentguard.action_audit import AuditLog
from agentguard.executors.mock_browser import MockBrowserExecutor
from agentguard.executors.mock_github import MockGitHubExecutor
from agentguard.models import ActionRequest, ApprovalResponse, Decision, ExecuteRequest
from agentguard.action_policy import evaluate_policy
from agentguard.risk import score_risk
from agentguard.token_service import TokenService

app = FastAPI(title="AgentGuard Action Proxy")
audit = AuditLog()
approvals = ApprovalStore()
tokens = TokenService()
previews: dict[str, dict[str, Any]] = {}
attempt_counter: dict[str, int] = {}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/actions/preview")
def preview_action(action: ActionRequest) -> dict[str, Any]:
    audit.log("action_requested", {"action_id": action.action_id, "action_type": action.action_type})
    key = f"{action.actor_id}:{action.action_type}:{action.target_resource}"
    attempts = attempt_counter.get(key, 0)

    decision, matched_policies, reason = evaluate_policy(action)
    audit.log("policy_evaluated", {"action_id": action.action_id, "matched_policies": matched_policies, "decision": decision.value})

    risk_score, risk_level, risk_factors = score_risk(action, repeated_attempts=attempts)
    audit.log("risk_scored", {"action_id": action.action_id, "risk_score": risk_score, "risk_level": risk_level.value, "risk_factors": risk_factors})

    approval_required = decision == Decision.REVIEW_REQUIRED
    if approval_required:
        audit.log("approval_requested", {"action_id": action.action_id})

    interpreted = f"{action.actor_type}:{action.actor_id} requests {action.action_type} on {action.target_system}/{action.target_resource}"
    preview = {
        "action_id": action.action_id,
        "interpreted_action_meaning": interpreted,
        "risk_score": risk_score,
        "risk_level": risk_level.value,
        "matched_policies": matched_policies,
        "decision": decision.value,
        "reason": reason,
        "approval_required": approval_required,
        "risk_factors": risk_factors,
    }
    previews[action.action_id] = preview
    attempt_counter[key] = attempts + 1
    audit.log("preview_generated", preview)
    return preview


@app.post("/actions/{action_id}/approve", response_model=ApprovalResponse)
def approve(action_id: str) -> ApprovalResponse:
    approvals.approve(action_id)
    audit.log("approved", {"action_id": action_id})
    return ApprovalResponse(action_id=action_id, status="approved")


@app.post("/actions/{action_id}/deny", response_model=ApprovalResponse)
def deny(action_id: str) -> ApprovalResponse:
    approvals.deny(action_id)
    audit.log("denied", {"action_id": action_id})
    return ApprovalResponse(action_id=action_id, status="denied")


@app.post("/actions/execute")
def execute_action(req: ExecuteRequest) -> dict[str, Any]:
    action = req.action_request
    preview = previews.get(action.action_id)
    if not preview:
        raise HTTPException(status_code=400, detail="preview_required_before_execute")

    decision = preview["decision"]
    approval = approvals.get(action.action_id)

    if decision == Decision.DENY.value:
        audit.log("execution_blocked", {"action_id": action.action_id, "reason": "policy_denied"})
        return {"action_id": action.action_id, "decision": "DENY", "executed": False, "message": "Execution denied by policy."}
    if decision == Decision.REVIEW_REQUIRED.value and approval != "approved":
        audit.log("execution_blocked", {"action_id": action.action_id, "reason": "approval_not_granted"})
        return {"action_id": action.action_id, "decision": "REVIEW_REQUIRED", "executed": False, "message": "Approval required before execution."}

    valid, reason = tokens.validate_for_execution(req.execution_token, action)
    if not valid:
        audit.log("execution_blocked", {"action_id": action.action_id, "reason": reason})
        return {"action_id": action.action_id, "decision": "BLOCKED", "executed": False, "message": reason}

    executor = MockGitHubExecutor() if action.target_system == "github" else MockBrowserExecutor()
    audit.log("execution_attempted", {"action_id": action.action_id, "executor": executor.__class__.__name__})
    result = executor.execute(action, req.execution_token)
    final = {"action_id": action.action_id, "decision": "ALLOW", **result}
    audit.log("execution_completed", final)
    return final


@app.get("/audit")
def get_audit() -> list[dict[str, Any]]:
    return audit.list()


@app.post("/demo/reset")
def reset_demo() -> dict[str, Any]:
    audit.clear()
    approvals.clear()
    tokens.clear()
    previews.clear()
    attempt_counter.clear()
    return {
        "status": "reset",
        "message": "새 데모 세션 초기화됨",
        "cleared": [
            "audit_timeline",
            "approval_workflow_state",
            "pending_actions",
            "execution_result",
            "issued_execution_tokens",
            "current_scenario_state",
        ],
    }


@app.get("/demo", response_class=HTMLResponse)
def demo() -> str:
    return Path("agentguard/demo/demo.html").read_text(encoding="utf-8")


@app.post("/actions/{action_id}/token")
def issue_token(action_id: str, action: ActionRequest) -> dict[str, str]:
    if action_id != action.action_id:
        raise HTTPException(status_code=400, detail="action_id_mismatch")
    token = tokens.issue(action)
    audit.log("token_issued", {"action_id": action.action_id, "token_id": token.token_id, "expires_at": token.expires_at.isoformat()})
    return {"token_id": token.token_id}
