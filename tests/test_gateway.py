from agentguard.gateway import AgentGuardGateway
from agentguard.policy import Policy


def test_approved_request_issues_token_and_consumes_once():
    gateway = AgentGuardGateway(
        Policy(max_amount=100, allowed_merchants={"Stripe"}, allowed_purposes={"SaaS"}, allowed_actions={"pay_invoice"})
    )
    token = gateway.request_execution(
        "did:openentry:agent:001",
        {"action": "pay_invoice", "amount": 50, "merchant": "Stripe", "purpose": "SaaS"},
    )

    assert token is not None
    assert gateway.consume_token_for_execution(token) == (True, "token_ok")
    assert gateway.consume_token_for_execution(token) == (False, "replay_detected")


def test_blocked_request_does_not_issue_token():
    gateway = AgentGuardGateway(
        Policy(max_amount=100, allowed_merchants={"Stripe"}, allowed_purposes={"SaaS"}, allowed_actions={"pay_invoice"})
    )
    token = gateway.request_execution(
        "did:openentry:agent:001",
        {"action": "pay_invoice", "amount": 500, "merchant": "Stripe", "purpose": "SaaS"},
    )

    assert token is None
    assert gateway.get_audit_anchor()["record_count"] == 1


def test_merkle_root_changes_with_records():
    gateway = AgentGuardGateway(
        Policy(max_amount=100, allowed_merchants={"Stripe"}, allowed_purposes={"SaaS"}, allowed_actions={"pay_invoice"})
    )
    root0 = gateway.get_audit_anchor()["merkle_root"]
    gateway.request_execution(
        "did:openentry:agent:001",
        {"action": "pay_invoice", "amount": 50, "merchant": "Stripe", "purpose": "SaaS"},
    )
    root1 = gateway.get_audit_anchor()["merkle_root"]

    assert root0 != root1


def test_request_execution_records_require_approval_without_token(monkeypatch):
    monkeypatch.setenv("XRPL_ISSUED_CURRENCY_ISSUER", "rIssuerTest")
    gateway = AgentGuardGateway(
        Policy(
            max_amount=100,
            allowed_destinations={"rDest1", "rDest2"},
            allowed_purposes={"ops"},
            allowed_actions={"pay"},
        )
    )

    for _ in range(3):
        gateway.process_action(
            agent_id="did:openentry:agent:001",
            wallet_address="rWallet1",
            action="pay",
            amount=10,
            currency="RLUSD",
            destination="rDest1",
            purpose="ops",
        )

    token = gateway.request_execution(
        "did:openentry:agent:001",
        {
            "agent_id": "did:openentry:agent:001",
            "wallet_address": "rWallet1",
            "action": "pay",
            "amount": 40,
            "currency": "RLUSD",
            "destination": "rDest2",
            "purpose": "ops",
            "timestamp": 1700000000,
        },
    )

    record = gateway.audit_log.records[-1]
    assert token is None
    assert record.status == "REQUIRE_APPROVAL"
    assert record.request["risk_score"] >= 70
    assert record.request["tx_payload_exists"] is False


def test_request_execution_amount_over_mvp_guardrail_blocks(monkeypatch):
    monkeypatch.setenv("USE_XRPL_SUBMIT", "true")
    monkeypatch.delenv("PYTEST_CURRENT_TEST", raising=False)
    gateway = AgentGuardGateway(
        Policy(max_amount=5000, allowed_destinations={"rDest1"}, allowed_purposes={"ops"}, allowed_actions={"pay"})
    )

    token = gateway.request_execution(
        "did:openentry:agent:001",
        {
            "agent_id": "did:openentry:agent:001",
            "wallet_address": "rWallet1",
            "action": "pay",
            "amount": 1001,
            "currency": "RLUSD",
            "destination": "rDest1",
            "purpose": "ops",
        },
    )

    assert token is None
    assert gateway.audit_log.records[-1].status == "BLOCKED"
    assert gateway.audit_log.records[-1].reason == "AMOUNT_GUARDRAIL_EXCEEDED"


def test_request_execution_mock_mode_does_not_submit(monkeypatch):
    monkeypatch.setenv("USE_XRPL_SUBMIT", "false")
    gateway = AgentGuardGateway(
        Policy(max_amount=100, allowed_destinations={"rDest1"}, allowed_purposes={"ops"}, allowed_actions={"pay"})
    )

    token = gateway.request_execution(
        "did:openentry:agent:001",
        {
            "agent_id": "did:openentry:agent:001",
            "wallet_address": "rWallet1",
            "action": "pay",
            "amount": 10,
            "currency": "RLUSD",
            "destination": "rDest1",
            "purpose": "ops",
        },
    )

    assert token is not None
    assert gateway.audit_log.records[-1].request["submit_status"] == "MOCK"


def test_request_execution_live_submit_records_tx_hash(monkeypatch):
    monkeypatch.setenv("USE_XRPL_SUBMIT", "true")
    monkeypatch.delenv("PYTEST_CURRENT_TEST", raising=False)

    gateway = AgentGuardGateway(
        Policy(max_amount=100, allowed_destinations={"rDest1"}, allowed_purposes={"ops"}, allowed_actions={"pay"})
    )

    def _mock_submit(tx_payload):
        return {"success": True, "tx_hash": "ABC123"}

    monkeypatch.setattr("agentguard.gateway.submit_xrpl_transaction", _mock_submit)

    token = gateway.request_execution(
        "did:openentry:agent:001",
        {
            "agent_id": "did:openentry:agent:001",
            "wallet_address": "rWallet1",
            "action": "pay",
            "amount": 10,
            "currency": "RLUSD",
            "destination": "rDest1",
            "purpose": "ops",
        },
    )

    assert token is not None
    assert gateway.audit_log.records[-1].request["submit_status"] == "SUBMITTED"
    assert gateway.audit_log.records[-1].request["tx_hash"] == "ABC123"


def test_request_execution_pytest_forces_mock_even_when_live_enabled(monkeypatch):
    monkeypatch.setenv("USE_XRPL_SUBMIT", "true")
    monkeypatch.setenv("PYTEST_CURRENT_TEST", "tests/test_gateway.py::test")

    gateway = AgentGuardGateway(
        Policy(max_amount=100, allowed_destinations={"rDest1"}, allowed_purposes={"ops"}, allowed_actions={"pay"})
    )

    called = {"value": False}

    def _mock_submit(tx_payload):
        called["value"] = True
        return {"success": True, "tx_hash": "ABC123"}

    monkeypatch.setattr("agentguard.gateway.submit_xrpl_transaction", _mock_submit)

    token = gateway.request_execution(
        "did:openentry:agent:001",
        {
            "agent_id": "did:openentry:agent:001",
            "wallet_address": "rWallet1",
            "action": "pay",
            "amount": 10,
            "currency": "RLUSD",
            "destination": "rDest1",
            "purpose": "ops",
        },
    )

    assert token is not None
    assert called["value"] is False
    assert gateway.audit_log.records[-1].request["submit_status"] == "MOCK"


def test_request_execution_live_without_seed_records_failed(monkeypatch):
    monkeypatch.setenv("USE_XRPL_SUBMIT", "true")
    monkeypatch.delenv("PYTEST_CURRENT_TEST", raising=False)
    monkeypatch.delenv("XRPL_TESTNET_SEED", raising=False)
    gateway = AgentGuardGateway(
        Policy(max_amount=100, allowed_destinations={"rDest1"}, allowed_purposes={"ops"}, allowed_actions={"pay"})
    )

    token = gateway.request_execution(
        "did:openentry:agent:001",
        {
            "agent_id": "did:openentry:agent:001",
            "wallet_address": "rWallet1",
            "action": "pay",
            "amount": 10,
            "currency": "RLUSD",
            "destination": "rDest1",
            "purpose": "ops",
        },
    )
    assert token is not None
    assert gateway.audit_log.records[-1].request["submit_status"] == "FAILED"
    assert gateway.audit_log.records[-1].request["submit_error"]


def test_blocked_never_calls_submit(monkeypatch):
    monkeypatch.setenv("USE_XRPL_SUBMIT", "true")
    monkeypatch.delenv("PYTEST_CURRENT_TEST", raising=False)
    called = {"value": False}

    def _mock_submit(tx_payload):
        called["value"] = True
        return {"success": True, "tx_hash": "ABC123"}

    monkeypatch.setattr("agentguard.gateway.submit_xrpl_transaction", _mock_submit)
    gateway = AgentGuardGateway(
        Policy(max_amount=5, allowed_destinations={"rDest1"}, allowed_purposes={"ops"}, allowed_actions={"pay"})
    )
    token = gateway.request_execution(
        "did:openentry:agent:001",
        {"agent_id": "did:openentry:agent:001", "wallet_address": "rWallet1", "action": "pay", "amount": 10, "currency": "RLUSD", "destination": "rDest1", "purpose": "ops"},
    )
    assert token is None
    assert called["value"] is False


def test_require_approval_never_calls_submit(monkeypatch):
    monkeypatch.setenv("USE_XRPL_SUBMIT", "true")
    monkeypatch.delenv("PYTEST_CURRENT_TEST", raising=False)
    called = {"value": False}

    def _mock_submit(tx_payload):
        called["value"] = True
        return {"success": True, "tx_hash": "ABC123"}

    monkeypatch.setattr("agentguard.gateway.submit_xrpl_transaction", _mock_submit)
    gateway = AgentGuardGateway(
        Policy(max_amount=100, allowed_destinations={"rDest1", "rDest2"}, allowed_purposes={"ops"}, allowed_actions={"pay"})
    )
    for _ in range(3):
        gateway.process_action(agent_id="did:openentry:agent:001", wallet_address="rWallet1", action="pay", amount=10, currency="RLUSD", destination="rDest1", purpose="ops")
    token = gateway.request_execution(
        "did:openentry:agent:001",
        {"agent_id": "did:openentry:agent:001", "wallet_address": "rWallet1", "action": "pay", "amount": 40, "currency": "RLUSD", "destination": "rDest2", "purpose": "ops", "timestamp": 1700000000},
    )
    assert token is None
    assert called["value"] is False

def test_request_execution_xrp_drops_amount_is_normalized_for_policy_and_kept_in_payload(monkeypatch):
    monkeypatch.setenv("USE_XRPL_SUBMIT", "true")
    monkeypatch.delenv("PYTEST_CURRENT_TEST", raising=False)
    gateway = AgentGuardGateway(
        Policy(max_amount=100, allowed_destinations={"rDest1"}, allowed_purposes={"ops"}, allowed_actions={"pay"})
    )

    captured = {"payload": None}

    def _mock_submit(tx_payload):
        captured["payload"] = tx_payload
        return {"success": True, "tx_hash": "ABC123"}

    monkeypatch.setattr("agentguard.gateway.submit_xrpl_transaction", _mock_submit)

    token = gateway.request_execution(
        "did:openentry:agent:001",
        {
            "agent_id": "did:openentry:agent:001",
            "wallet_address": "rWallet1",
            "action": "pay",
            "amount": "1000000",
            "currency": "XRP",
            "destination": "rDest1",
            "purpose": "ops",
        },
    )

    assert token is not None
    assert captured["payload"]["Amount"] == "1000000"
    assert isinstance(captured["payload"]["Amount"], str)
    record = gateway.audit_log.records[-1].request
    assert record["amount_raw"] == "1000000"
    assert record["amount_normalized"] == 1.0
    assert record["currency"] == "XRP"
