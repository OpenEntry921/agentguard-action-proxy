from agentguard.xrpl.checks.destination_checker import check_account_exists, check_new_destination
from agentguard.xrpl.ledger.ledger_client import MockLedgerClient


def test_account_info_failure_account_not_found():
    policy = {"destination_policy": {"require_account_exists": True, "block_if_account_not_found": True}}
    result = check_account_exists("rDest1", MockLedgerClient(), policy)
    assert result["passed"] is True
    assert result["reason"] is None
    assert result["account_exists"] == "not_checked"


def test_account_info_success_with_nested_result_wrapper():
    policy = {"destination_policy": {"require_account_exists": True, "block_if_account_not_found": True}}
    client = MockLedgerClient()
    client.set_account_info(
        "rDest1",
        {
            "result": {
                "result": {
                    "status": "success",
                    "account_data": {"Account": "rDest1"},
                }
            }
        },
    )
    result = check_account_exists("rDest1", client, policy)
    assert result["passed"] is True
    assert result["account_exists"] == "not_checked"


def test_new_destination_is_risk_flag_not_block():
    policy = {"history_policy": {"detect_new_destination": True, "enable_account_tx_lookup": False}, "destination_policy": {"new_destination_risk_score": 20}}
    result = check_new_destination("rWallet1", "rDest1", MockLedgerClient(), policy)
    assert result["is_new_destination"] is True
    assert "new_destination" in result["risk_flags"]
