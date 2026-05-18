from agentguard.models import ActionRequest
from agentguard.action_policy import evaluate_policy


def test_policy_readonly_allow():
    req = ActionRequest(action_id='1', actor_type='ai_agent', actor_id='a', action_type='github.get_repository_status', target_system='github', target_resource='production/repo', parameters={}, context={})
    d, _, _ = evaluate_policy(req)
    assert d.value == 'ALLOW'
