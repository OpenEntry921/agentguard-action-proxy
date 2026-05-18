from agentguard.policy_engine import PolicyEngine
from agentguard.xrpl.ledger.ledger_client import MockLedgerClient


def test_xrp_native_mode_passes_without_trustline_lookup():
    engine = PolicyEngine("configs/policy.yaml")
    client = MockLedgerClient()
    client.set_account_info("rDest1", {"result": {"status": "success"}})
    result = engine.evaluate_policy(
        agent_id="did:openentry:agent:treasury-01",
        action="xrpl_payment",
        amount=1000,
        destination="rDest1",
        purpose="ops",
        context={"currency": "XRP", "ledger_client": client, "allow_mock_destination": True, "after_hours_execution": False},
    )
    assert result["decision"] == "APPROVED"
    assert result["xrpl_checks"]["trustline_source"] == "native_xrp_no_trustline_required"
