from agentguard.policy_engine import PolicyEngine


def _base_args():
    return {
        "agent_id": "did:openentry:agent:treasury-01",
        "action": "xrpl_payment",
        "amount": 1_000_000,
        "destination": "rnAo7npmjoMhAuYZtnGGjAffsJJPxs3sHk",
        "purpose": "ops",
        "context": {"after_hours_execution": False},
    }


def test_amount_exceeded_adds_amount_limit_exceeded_flag():
    engine = PolicyEngine("configs/policy.yaml")
    args = _base_args()
    args["amount"] = 3_000_001

    result = engine.evaluate_policy(**args)

    assert result["decision"] == "BLOCKED"
    assert "amount_limit_exceeded" in result["risk_flags"]


def test_non_whitelisted_valid_destination_returns_conditional_approval():
    engine = PolicyEngine("configs/policy.yaml")
    args = _base_args()
    args["destination"] = "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe"

    result = engine.evaluate_policy(**args)

    assert result["decision"] == "CONDITIONAL_APPROVAL"
    assert result["risk_score"] == 40
    assert "destination_not_whitelisted" in result["risk_flags"]
    assert result["reason"] == "destination_not_whitelisted_but_valid"


def test_amount_exceeded_and_non_whitelisted_destination_is_still_blocked():
    engine = PolicyEngine("configs/policy.yaml")
    args = _base_args()
    args["amount"] = 3_000_001
    args["destination"] = "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe"

    result = engine.evaluate_policy(**args)

    assert result["decision"] == "BLOCKED"
    assert "amount_limit_exceeded" in result["risk_flags"]
    assert "destination_not_whitelisted" in result["risk_flags"]


def test_explanation_exists_for_approved_conditional_blocked_and_is_deterministic_and_sanitized():
    engine = PolicyEngine("configs/policy.yaml")

    approved = engine.evaluate_policy(**_base_args())
    assert approved["decision"] == "APPROVED"
    assert isinstance(approved.get("execution_explanation"), str)
    assert approved["execution_explanation"]

    conditional_args = _base_args()
    conditional_args["destination"] = "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe"
    conditional = engine.evaluate_policy(**conditional_args)
    assert conditional["decision"] == "CONDITIONAL_APPROVAL"
    assert isinstance(conditional.get("execution_explanation"), str)
    assert conditional["execution_explanation"]

    blocked_args = _base_args()
    blocked_args["amount"] = 3_000_001
    blocked = engine.evaluate_policy(**blocked_args)
    assert blocked["decision"] == "BLOCKED"
    assert isinstance(blocked.get("execution_explanation"), str)
    assert blocked["execution_explanation"]

    again = engine.evaluate_policy(**blocked_args)
    assert blocked["execution_explanation"] == again["execution_explanation"]

    lower = blocked["execution_explanation"].lower()
    assert "seed" not in lower
    assert "private" not in lower
