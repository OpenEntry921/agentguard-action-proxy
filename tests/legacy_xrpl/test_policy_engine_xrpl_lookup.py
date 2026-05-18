from agentguard.policy_engine import PolicyEngine
from agentguard.xrpl.ledger.ledger_client import MockLedgerClient


def test_policy_engine_mock_lookup_does_not_block_on_account_not_found():
    engine = PolicyEngine("configs/policy.yaml")
    result = engine.evaluate_policy(
        agent_id="did:openentry:agent:treasury-01", action="xrpl_payment", amount=1000,
        destination="rDest1", purpose="ops", context={"currency": "XRP", "ledger_client": MockLedgerClient()}
    )
    assert result["decision"] in {"APPROVED", "CONDITIONAL_APPROVAL"}
    assert result["reason"] != "account_not_found"
    assert result["xrpl_lookup_mode"] == "MOCK"
    assert result["xrpl_checks"]["account_exists"] == "not_checked"
