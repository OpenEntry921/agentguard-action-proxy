from agentguard.models import ActionRequest
from agentguard.risk import score_risk


def test_budget_risk_high():
    req = ActionRequest(action_id='1', actor_type='ai_agent', actor_id='a', action_type='browser.update_ad_budget', target_system='browser', target_resource='campaign', parameters={'current_budget':500000,'new_budget':50000000}, context={})
    score, level, _ = score_risk(req)
    assert score >= 70
    assert level.value in {'HIGH','CRITICAL'}
