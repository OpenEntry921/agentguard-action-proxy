from agentguard.xrpl.ledger.ledger_client import MockLedgerClient
from agentguard.xrpl.trustline.trustline_checker import check_trustline


def test_xrp_passes_without_trustline():
    policy = {"trustline_policy": {"allow_xrp_without_trustline": True}, "legacy_whitelist": {"enabled": True, "allowed_destinations": ["rDest1"]}}
    result = check_trustline("rDest1", "XRP", None, policy, MockLedgerClient())
    assert result["passed"] is True
    assert result["trustline_source"] == "native_xrp_no_trustline_required"


def test_rlusd_without_trustline_is_blocked():
    policy = {"trustline_policy": {"allowed_currencies": ["RLUSD"]}}
    result = check_trustline("rDest1", "RLUSD", "rIssuerA", policy, MockLedgerClient())
    assert result["passed"] is False
    assert "trustline_missing" in result["risk_flags"]


def test_issuer_not_allowed_blocked():
    policy = {"trustline_policy": {"allowed_currencies": ["RLUSD"], "allowed_issuers": ["rIssuerA"]}}
    client = MockLedgerClient()
    client.set_account_lines("rDest1", {"result": {"status": "success", "lines": [{"currency": "RLUSD", "account": "rIssuerB"}]}})
    result = check_trustline("rDest1", "RLUSD", "rIssuerA", policy, client)
    assert result["passed"] is False
    assert "issuer_not_allowed" in result["risk_flags"]
