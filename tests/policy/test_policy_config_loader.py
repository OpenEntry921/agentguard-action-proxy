from agentguard.policy import load_policy_config


def test_load_policy_config_merges_split_files():
    policy = load_policy_config("configs/policy.yaml")
    assert "trustline_policy" in policy
    assert "destination_policy" in policy
    assert "history_policy" in policy
    assert "risk_rules" in policy
