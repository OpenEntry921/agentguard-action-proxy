from fastapi.testclient import TestClient
from agentguard.api import app


def test_preview_then_execute_allow():
    c = TestClient(app)
    req = {"action_id":"x1","actor_type":"ai_agent","actor_id":"a1","action_type":"github.get_repository_status","target_system":"github","target_resource":"repo","parameters":{},"context":{},"requested_at":"2026-05-18T00:00:00Z"}
    p = c.post('/actions/preview', json=req)
    assert p.status_code == 200
    token = c.post('/actions/x1/token', json=req).json()['token_id']
    e = c.post('/actions/execute', json={'action_request':req,'execution_token':token})
    assert e.status_code == 200
    assert e.json()['executed'] is True
