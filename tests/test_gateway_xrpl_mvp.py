from agentguard.gateway import AgentGuardGateway
from agentguard.policy import Policy


def test_rlusd_within_policy_creates_token_payload_and_audit(monkeypatch):
    monkeypatch.setenv("XRPL_ISSUED_CURRENCY_ISSUER", "rIssuerTest")
    gateway = AgentGuardGateway(
        Policy(max_amount=100, allowed_destinations={"rDest1"}, allowed_purposes={"ops"}, allowed_actions={"pay"})
    )

    result = gateway.process_action(
        agent_id="did:openentry:agent:001",
        wallet_address="rWallet1",
        action="pay",
        amount=50,
        currency="RLUSD",
        destination="rDest1",
        purpose="ops",
    )

    assert result["approved"] is True
    assert result["token"].payload["jti"]
    assert result["tx_payload"]["Amount"]["currency"] == "RLUSD"
    assert gateway.get_audit_anchor()["record_count"] == 1


def test_over_limit_is_blocked_and_no_token_or_tx(monkeypatch):
    monkeypatch.setenv("XRPL_ISSUED_CURRENCY_ISSUER", "rIssuerTest")
    gateway = AgentGuardGateway(
        Policy(max_amount=100, allowed_destinations={"rDest1"}, allowed_purposes={"ops"}, allowed_actions={"pay"})
    )

    result = gateway.process_action(
        agent_id="did:openentry:agent:001",
        wallet_address="rWallet1",
        action="pay",
        amount=150,
        currency="RLUSD",
        destination="rDest1",
        purpose="ops",
    )

    assert result["approved"] is False
    assert "token" not in result
    assert "tx_payload" not in result
    assert gateway.audit_log.records[-1].status == "BLOCKED"


def test_disallowed_destination_is_blocked(monkeypatch):
    monkeypatch.setenv("XRPL_ISSUED_CURRENCY_ISSUER", "rIssuerTest")
    gateway = AgentGuardGateway(
        Policy(max_amount=100, allowed_destinations={"rDest1"}, allowed_purposes={"ops"}, allowed_actions={"pay"})
    )

    result = gateway.process_action(
        agent_id="did:openentry:agent:001",
        wallet_address="rWallet1",
        action="pay",
        amount=50,
        currency="RLUSD",
        destination="rDest2",
        purpose="ops",
    )

    assert result["approved"] is False
    assert gateway.audit_log.records[-1].status == "BLOCKED"
    assert result["reason"] == "DESTINATION_NOT_ALLOWED"


def test_daily_limit_exceeded_is_blocked_and_audited(monkeypatch):
    monkeypatch.setenv("XRPL_ISSUED_CURRENCY_ISSUER", "rIssuerTest")
    gateway = AgentGuardGateway(
        Policy(
            max_amount=100,
            daily_limit=100,
            allowed_destinations={"rDest1"},
            allowed_purposes={"ops"},
            allowed_actions={"pay"},
        )
    )

    first = gateway.process_action(
        agent_id="did:openentry:agent:001",
        wallet_address="rWallet1",
        action="pay",
        amount=60,
        currency="RLUSD",
        destination="rDest1",
        purpose="ops",
    )
    second = gateway.process_action(
        agent_id="did:openentry:agent:001",
        wallet_address="rWallet1",
        action="pay",
        amount=50,
        currency="RLUSD",
        destination="rDest1",
        purpose="ops",
    )

    assert first["approved"] is True
    assert second["approved"] is False
    assert second["reason"] == "DAILY_LIMIT_EXCEEDED"
    assert "token" not in second
    assert "tx_payload" not in second
    assert gateway.audit_log.records[-1].status == "BLOCKED"
    assert gateway.audit_log.records[-1].request["request_hash"] == second["request"]["request_hash"]
    assert gateway.audit_log.records[-1].request["tx_payload_exists"] is False


def test_blocked_request_contains_no_token_no_tx_and_audit_fields(monkeypatch):
    monkeypatch.setenv("XRPL_ISSUED_CURRENCY_ISSUER", "rIssuerTest")
    gateway = AgentGuardGateway(
        Policy(
            max_amount=100,
            allowed_destinations={"rDest1"},
            allowed_purposes={"ops"},
            allowed_actions={"pay"},
        )
    )

    result = gateway.process_action(
        agent_id="did:openentry:agent:001",
        wallet_address="rWallet1",
        action="pay",
        amount=50,
        currency="RLUSD",
        destination="rDest2",
        purpose="ops",
    )

    record = gateway.audit_log.records[-1]
    assert result["approved"] is False
    assert "token" not in result
    assert "tx_payload" not in result
    assert record.request["decision"] == "BLOCKED"
    assert record.request["reason"] == "DESTINATION_NOT_ALLOWED"
    assert record.request["policy_id"] == "default_policy"
    assert record.request["token_id"] is None
    assert record.request["tx_payload_exists"] is False
    assert record.request["request_hash"]


def test_new_destination_adds_risk_but_can_still_be_approved(monkeypatch):
    monkeypatch.setenv("XRPL_ISSUED_CURRENCY_ISSUER", "rIssuerTest")
    gateway = AgentGuardGateway(
        Policy(max_amount=100, allowed_destinations={"rDest1", "rDest2"}, allowed_purposes={"ops"}, allowed_actions={"pay"})
    )

    first = gateway.process_action(
        agent_id="did:openentry:agent:001",
        wallet_address="rWallet1",
        action="pay",
        amount=20,
        currency="RLUSD",
        destination="rDest1",
        purpose="ops",
    )
    second = gateway.process_action(
        agent_id="did:openentry:agent:001",
        wallet_address="rWallet1",
        action="pay",
        amount=20,
        currency="RLUSD",
        destination="rDest2",
        purpose="ops",
    )

    assert first["approved"] is True
    assert second["approved"] is True
    assert gateway.audit_log.records[-1].request["risk_score"] >= 30
    assert "new_destination" in gateway.audit_log.records[-1].request["risk_flags"]


def test_amount_spike_increases_risk_score(monkeypatch):
    monkeypatch.setenv("XRPL_ISSUED_CURRENCY_ISSUER", "rIssuerTest")
    gateway = AgentGuardGateway(
        Policy(max_amount=100, allowed_destinations={"rDest1"}, allowed_purposes={"ops"}, allowed_actions={"pay"})
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

    spiked = gateway.process_action(
        agent_id="did:openentry:agent:001",
        wallet_address="rWallet1",
        action="pay",
        amount=40,
        currency="RLUSD",
        destination="rDest1",
        purpose="ops",
    )
    assert spiked["approved"] is True
    assert gateway.audit_log.records[-1].request["risk_score"] >= 30
    assert "amount_spike" in gateway.audit_log.records[-1].request["risk_flags"]


def test_frequency_spike_increases_risk_score(monkeypatch):
    monkeypatch.setenv("XRPL_ISSUED_CURRENCY_ISSUER", "rIssuerTest")
    gateway = AgentGuardGateway(
        Policy(max_amount=100, allowed_destinations={"rDest1"}, allowed_purposes={"ops"}, allowed_actions={"pay"})
    )
    for _ in range(5):
        gateway.process_action(
            agent_id="did:openentry:agent:001",
            wallet_address="rWallet1",
            action="pay",
            amount=10,
            currency="RLUSD",
            destination="rDest1",
            purpose="ops",
        )

    result = gateway.process_action(
        agent_id="did:openentry:agent:001",
        wallet_address="rWallet1",
        action="pay",
        amount=10,
        currency="RLUSD",
        destination="rDest1",
        purpose="ops",
    )
    assert result["approved"] is True
    assert "frequency_spike" in gateway.audit_log.records[-1].request["risk_flags"]


def test_risk_threshold_requires_approval_and_no_token_no_tx(monkeypatch):
    monkeypatch.setenv("XRPL_ISSUED_CURRENCY_ISSUER", "rIssuerTest")
    gateway = AgentGuardGateway(
        Policy(max_amount=100, allowed_destinations={"rDest1", "rDest2"}, allowed_purposes={"ops"}, allowed_actions={"pay"})
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
    for _ in range(5):
        gateway.process_action(
            agent_id="did:openentry:agent:001",
            wallet_address="rWallet1",
            action="pay",
            amount=10,
            currency="RLUSD",
            destination="rDest1",
            purpose="ops",
        )

    result = gateway.process_action(
        agent_id="did:openentry:agent:001",
        wallet_address="rWallet1",
        action="pay",
        amount=40,
        currency="RLUSD",
        destination="rDest2",
        purpose="ops",
    )
    record = gateway.audit_log.records[-1]
    assert result["approved"] is False
    assert result["decision"] == "REQUIRE_APPROVAL"
    assert "token" not in result
    assert "tx_payload" not in result
    assert record.status == "REQUIRE_APPROVAL"
    assert record.request["risk_score"] >= 70


def _build_high_risk_gateway(monkeypatch):
    monkeypatch.setenv("XRPL_ISSUED_CURRENCY_ISSUER", "rIssuerTest")
    gateway = AgentGuardGateway(
        Policy(max_amount=100, allowed_destinations={"rDest1", "rDest2"}, allowed_purposes={"ops"}, allowed_actions={"pay"})
    )
    for _ in range(3):
        gateway.process_action(
            agent_id="did:openentry:agent:001", wallet_address="rWallet1", action="pay",
            amount=10, currency="RLUSD", destination="rDest1", purpose="ops"
        )
    for _ in range(5):
        gateway.process_action(
            agent_id="did:openentry:agent:001", wallet_address="rWallet1", action="pay",
            amount=10, currency="RLUSD", destination="rDest1", purpose="ops"
        )
    return gateway


def test_approve_request_generates_token_tx_and_audit(monkeypatch):
    gateway = _build_high_risk_gateway(monkeypatch)
    pending = gateway.process_action(
        agent_id="did:openentry:agent:001", wallet_address="rWallet1", action="pay",
        amount=40, currency="RLUSD", destination="rDest2", purpose="ops"
    )
    assert pending["decision"] == "REQUIRE_APPROVAL"
    assert "token" not in pending
    assert "tx_payload" not in pending

    approved = gateway.approve_request(pending["approval_id"])
    assert approved["approved"] is True
    assert approved["token"].payload["jti"]
    assert approved["tx_payload"]["Destination"] == "rDest2"
    assert gateway.audit_log.records[-1].status == "APPROVED_AFTER_HUMAN_APPROVAL"


def test_reject_request_keeps_no_token_and_audits(monkeypatch):
    gateway = _build_high_risk_gateway(monkeypatch)
    pending = gateway.process_action(
        agent_id="did:openentry:agent:001", wallet_address="rWallet1", action="pay",
        amount=40, currency="RLUSD", destination="rDest2", purpose="ops"
    )

    rejected = gateway.reject_request(pending["approval_id"])
    assert rejected["approved"] is False
    assert rejected["decision"] == "REJECTED"
    assert gateway.get_approval_request(pending["approval_id"])["status"] == "REJECTED"
    assert gateway.audit_log.records[-1].status == "REJECTED_BY_HUMAN"


def test_expired_approval_cannot_be_approved(monkeypatch):
    gateway = _build_high_risk_gateway(monkeypatch)
    pending = gateway.process_action(
        agent_id="did:openentry:agent:001", wallet_address="rWallet1", action="pay",
        amount=40, currency="RLUSD", destination="rDest2", purpose="ops"
    )
    gateway.approval_requests[pending["approval_id"]]["expires_at"] = 0
    gateway.expire_approval_requests()

    failed = gateway.approve_request(pending["approval_id"])
    assert failed["approved"] is False
    assert "EXPIRED" in failed["reason"]
    assert any(r.status == "EXPIRED" for r in gateway.audit_log.records)


def test_audit_record_has_record_hash_and_is_deterministic(monkeypatch):
    monkeypatch.setenv("XRPL_ISSUED_CURRENCY_ISSUER", "rIssuerTest")
    gateway = AgentGuardGateway(
        Policy(max_amount=100, allowed_destinations={"rDest1"}, allowed_purposes={"ops"}, allowed_actions={"pay"})
    )
    gateway.process_action(
        agent_id="did:openentry:agent:001", wallet_address="rWallet1", action="pay",
        amount=10, currency="RLUSD", destination="rDest1", purpose="ops"
    )
    record = gateway.audit_log.records[-1]
    assert record.record_hash
    assert gateway.audit_log.record_hash(record) == record.record_hash


def test_merkle_proof_generation_and_verification(monkeypatch):
    monkeypatch.setenv("XRPL_ISSUED_CURRENCY_ISSUER", "rIssuerTest")
    gateway = AgentGuardGateway(
        Policy(max_amount=100, allowed_destinations={"rDest1"}, allowed_purposes={"ops"}, allowed_actions={"pay"})
    )
    for amount in [10, 20, 30]:
        gateway.process_action(
            agent_id="did:openentry:agent:001", wallet_address="rWallet1", action="pay",
            amount=amount, currency="RLUSD", destination="rDest1", purpose="ops"
        )
    merkle_root = gateway.audit_log.merkle_root()
    assert merkle_root
    target_hash = gateway.audit_log.records[1].record_hash
    proof = gateway.audit_log.generate_merkle_proof(target_hash)
    assert proof
    assert gateway.audit_log.verify_merkle_proof(target_hash, proof, merkle_root) is True
    tampered_hash = "0" * 64
    assert gateway.audit_log.verify_merkle_proof(tampered_hash, proof, merkle_root) is False


def test_audit_record_query_by_request_hash_and_approval_id(monkeypatch):
    gateway = _build_high_risk_gateway(monkeypatch)
    pending = gateway.process_action(
        agent_id="did:openentry:agent:001", wallet_address="rWallet1", action="pay",
        amount=40, currency="RLUSD", destination="rDest2", purpose="ops"
    )
    request_hash = pending["request"]["request_hash"]
    approval_id = pending["approval_id"]

    by_request = gateway.audit_log.get_audit_records_by_request_hash(request_hash)
    by_approval = gateway.audit_log.get_audit_records_by_approval_id(approval_id)
    assert by_request
    assert by_approval
    assert any(r.request.get("approval_id") == approval_id for r in by_request)


def test_enhanced_anchor_payload_contains_required_fields(monkeypatch):
    monkeypatch.setenv("XRPL_ISSUED_CURRENCY_ISSUER", "rIssuerTest")
    gateway = AgentGuardGateway(
        Policy(max_amount=100, allowed_destinations={"rDest1"}, allowed_purposes={"ops"}, allowed_actions={"pay"})
    )
    gateway.process_action(
        agent_id="did:openentry:agent:001", wallet_address="rWallet1", action="pay",
        amount=10, currency="RLUSD", destination="rDest1", purpose="ops"
    )
    anchor = gateway.get_audit_anchor()
    assert "merkle_root" in anchor
    assert "record_count" in anchor
    assert "generated_at" in anchor
    assert "latest_record_hash" in anchor
