import time

from agentguard.runtime.transient_token_engine import TransientActionTokenEngine


def test_issue_and_validate_token_success():
    engine = TransientActionTokenEngine(ttl_seconds=60)
    token = engine.issue_token({"did": "did:agent:1", "destination": "rDest", "amount_drops": 1000000, "currency": "XRP"})
    validated = engine.validate_token(token["token_id"])
    assert validated["valid"] is True


def test_token_reuse_block_and_expired_block():
    engine = TransientActionTokenEngine(ttl_seconds=1)
    token = engine.issue_token({"did": "did:agent:1", "destination": "rDest", "amount_drops": 1})
    engine.invalidate_token(token["token_id"])
    assert engine.validate_token(token["token_id"])["reason"] == "replay_attack_detected"

    t2 = engine.issue_token({"did": "did:agent:1", "destination": "rDest", "amount_drops": 1})
    time.sleep(1.1)
    assert engine.validate_token(t2["token_id"])["reason"] == "expired_token"
