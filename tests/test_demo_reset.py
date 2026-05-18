from fastapi.testclient import TestClient

from agentguard.api import app


def review_required_request(action_id: str = "reset-act") -> dict[str, object]:
    return {
        "action_id": action_id,
        "actor_type": "ai_agent",
        "actor_id": "browser-agent-1",
        "action_type": "browser.update_ad_budget",
        "target_system": "Meta Ads",
        "target_resource": "campaign-42",
        "parameters": {"current_budget": 500000, "new_budget": 50000000, "currency": "KRW"},
        "context": {"environment": "Cloud RBI Session", "flow": "ad_optimization"},
        "requested_at": "2026-05-18T00:00:00Z",
    }


def test_demo_reset_clears_in_memory_session_state():
    c = TestClient(app)
    c.post("/demo/reset")
    req = review_required_request()

    assert c.post("/actions/preview", json=req).status_code == 200
    assert c.post("/actions/reset-act/approve").status_code == 200
    token = c.post("/actions/reset-act/token", json=req).json()["token_id"]
    assert c.get("/audit").json()

    reset = c.post("/demo/reset")

    assert reset.status_code == 200
    assert reset.json()["status"] == "reset"
    assert c.get("/audit").json() == []

    execute_without_new_preview = c.post(
        "/actions/execute",
        json={"action_request": req, "execution_token": token},
    )
    assert execute_without_new_preview.status_code == 400
    assert execute_without_new_preview.json()["detail"] == "preview_required_before_execute"

    assert c.post("/actions/preview", json=req).status_code == 200
    execute_without_approval = c.post(
        "/actions/execute",
        json={"action_request": req, "execution_token": token},
    )
    assert execute_without_approval.status_code == 200
    assert execute_without_approval.json()["executed"] is False
    assert execute_without_approval.json()["message"] == "Approval required before execution."

    assert c.post("/actions/reset-act/approve").status_code == 200
    execute_with_reset_token = c.post(
        "/actions/execute",
        json={"action_request": req, "execution_token": token},
    )
    assert execute_with_reset_token.status_code == 200
    assert execute_with_reset_token.json()["executed"] is False
    assert execute_with_reset_token.json()["message"] == "token_not_found"
