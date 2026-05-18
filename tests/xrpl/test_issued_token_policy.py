from agentguard.policy_engine import PolicyEngine
from agentguard.xrpl.ledger.ledger_client import MockLedgerClient


def test_issued_token_without_account_lines_is_blocked():
    engine = PolicyEngine("configs/policy.yaml")
    client = MockLedgerClient()
    client.set_account_info("rDest1", {"result": {"status": "success"}})
    result = engine.evaluate_policy(
        agent_id="did:openentry:agent:treasury-01",
        action="xrpl_payment",
        amount=1000,
        destination="rDest1",
        purpose="ops",
        context={"currency": "RLUSD", "issuer": "rIssuerA", "ledger_client": client, "allow_mock_destination": True},
    )
    assert result["decision"] == "BLOCKED"
    assert "trustline_missing" in result["risk_flags"] or result["reason"] == "trustline_missing"
