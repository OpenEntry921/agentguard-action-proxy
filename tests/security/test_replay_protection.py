from agentguard.security.replay_protection import ReplayProtection


def test_duplicate_nonce_block_and_token_reuse():
    rp = ReplayProtection()
    assert rp.register_nonce("n1") is True
    assert rp.register_nonce("n1") is False
    rp.register_token_usage("t1")
    assert rp.token_already_used("t1") is True
