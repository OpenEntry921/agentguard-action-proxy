from fastapi.testclient import TestClient

from agentguard.api import app


def _request(action_id: str = "act-1", **overrides):
    req = {
        "action_id": action_id,
        "actor_type": "ai_agent",
        "actor_id": "agent-1",
        "action_type": "github.get_repository_status",
        "target_system": "github",
        "target_resource": "repo/demo",
        "parameters": {},
        "context": {},
        "requested_at": "2026-05-18T00:00:00Z",
    }
    req.update(overrides)
    return req


def test_actions_preview_and_execute_allow_flow():
    c = TestClient(app)
    req = _request(action_id="allow-1")

    preview = c.post("/actions/preview", json=req)
    assert preview.status_code == 200
    body = preview.json()
    assert body["decision"] == "ALLOW"
    assert body["approval_required"] is False

    token_id = c.post(f"/actions/{req['action_id']}/token", json=req).json()["token_id"]
    execute = c.post("/actions/execute", json={"action_request": req, "execution_token": token_id})
    assert execute.status_code == 200
    assert execute.json()["executed"] is True


def test_policy_evaluation_and_approval_flow_requires_approve_before_execute():
    c = TestClient(app)
    req = _request(
        action_id="review-1",
        action_type="github.change_branch_protection",
        target_resource="repo/production-service",
    )

    preview = c.post("/actions/preview", json=req).json()
    assert preview["decision"] == "REVIEW_REQUIRED"
    assert preview["approval_required"] is True
    assert "review_branch_protection_change" in preview["matched_policies"]

    token_id = c.post(f"/actions/{req['action_id']}/token", json=req).json()["token_id"]

    blocked = c.post("/actions/execute", json={"action_request": req, "execution_token": token_id}).json()
    assert blocked["executed"] is False
    assert blocked["decision"] == "REVIEW_REQUIRED"

    approve = c.post(f"/actions/{req['action_id']}/approve")
    assert approve.status_code == 200

    executed = c.post("/actions/execute", json={"action_request": req, "execution_token": token_id}).json()
    assert executed["executed"] is True
    assert executed["decision"] == "ALLOW"


def test_risk_scoring_and_replay_protection_and_ephemeral_token_validation():
    c = TestClient(app)
    req = _request(
        action_id="token-1",
        action_type="github.export_secrets",
        target_resource="repo/production-service",
    )

    first_preview = c.post("/actions/preview", json=req).json()
    second_preview = c.post("/actions/preview", json=req).json()

    assert first_preview["risk_score"] >= 60
    assert first_preview["risk_level"] in {"MEDIUM", "HIGH", "CRITICAL"}
    assert "secret_export" in first_preview["risk_factors"]
    assert "repeated_attempts" in second_preview["risk_factors"]

    token_id = c.post(f"/actions/{req['action_id']}/token", json=req).json()["token_id"]
    c.post(f"/actions/{req['action_id']}/approve")

    first_exec = c.post("/actions/execute", json={"action_request": req, "execution_token": token_id}).json()
    assert first_exec["executed"] is True

    replay = c.post("/actions/execute", json={"action_request": req, "execution_token": token_id}).json()
    assert replay["executed"] is False
    assert replay["message"] == "token_already_used"


def test_audit_logging_records_preview_policy_risk_token_and_execution_events():
    c = TestClient(app)
    req = _request(action_id="audit-1", action_type="github.get_repository_status")

    c.post("/actions/preview", json=req)
    token_id = c.post(f"/actions/{req['action_id']}/token", json=req).json()["token_id"]
    c.post("/actions/execute", json={"action_request": req, "execution_token": token_id})

    events = c.get("/audit").json()
    event_types = [e["event_type"] for e in events if e["payload"].get("action_id") == req["action_id"]]

    assert "action_requested" in event_types
    assert "policy_evaluated" in event_types
    assert "risk_scored" in event_types
    assert "preview_generated" in event_types
    assert "token_issued" in event_types
    assert "execution_attempted" in event_types
    assert "execution_completed" in event_types
