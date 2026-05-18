from agentguard.policy import compute_policy_hash
from agentguard.runtime.request_hash import compute_request_hash
from agentguard.xrpl_payment import attach_agentguard_memo


def test_policy_hash_deterministic():
    p1 = {"b": 2, "a": 1}
    p2 = {"a": 1, "b": 2}
    assert compute_policy_hash(p1) == compute_policy_hash(p2)


def test_request_hash_deterministic():
    r1 = {"did": "d", "destination": "r", "amount_drops": 1}
    r2 = {"amount_drops": 1, "destination": "r", "did": "d"}
    assert compute_request_hash(r1) == compute_request_hash(r2)


def test_xrpl_memo_contains_policy_anchor_fields():
    tx = {"TransactionType": "Payment"}
    memoed = attach_agentguard_memo(tx, agent_id="a", policy_id="pid", token_id="tid", policy_hash="ph", decision_id="did", risk_score=12)
    assert memoed.get("Memos")
