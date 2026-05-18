from agentguard.models import ActionRequest
from agentguard.token_service import TokenService


def test_token_single_use():
    req = ActionRequest(action_id='1', actor_type='ai_agent', actor_id='a', action_type='github.get_repository_status', target_system='github', target_resource='repo', parameters={}, context={})
    svc = TokenService()
    t = svc.issue(req)
    assert svc.validate_for_execution(t.token_id, req)[0] is True
    assert svc.validate_for_execution(t.token_id, req)[0] is False
