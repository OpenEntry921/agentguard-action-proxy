import os
import pytest
import yaml
from fastapi.testclient import TestClient
from xrpl.wallet import Wallet

import agentguard.api as api_module
from agentguard.api import create_app, create_default_gateway

os.environ.setdefault("XRPL_TESTNET_SEED", Wallet.create().seed)

class _BoundWallet:
    classic_address = "rGEB4qm9SKvuJVuA4Yh5VgEsV9vy9ofZY6"


@pytest.fixture(autouse=True)
def _mock_wallet_from_seed(monkeypatch):
    def _fake(seed):
        if seed in {"sTEST", os.environ.get("XRPL_TESTNET_SEED")}:
            return _BoundWallet()
        raise ValueError("invalid")
    monkeypatch.setattr("xrpl.wallet.Wallet.from_seed", _fake)


def make_client():
    gateway = create_default_gateway()
    app = create_app(gateway)
    return TestClient(app), gateway


def _base_payload(amount=10, destination="rnAo7npmjoMhAuYZtnGGjAffsJJPxs3sHk"):
    return {
        "agent_id": "did:openentry:agent:treasury-01",
        "action": "pay",
        "amount": amount,
        "currency": "RLUSD",
        "destination": destination,
        "purpose": "ops",
        "signer_seed": "sTEST",
        "context": {"source": "test"},
    }


def test_health_returns_ok():
    client, _ = make_client()
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}




def test_default_gateway_keeps_static_whitelist_without_env(monkeypatch):
    monkeypatch.delenv("XRPL_TESTNET_DESTINATION", raising=False)

    gateway = create_default_gateway()

    assert {"rnAo7npmjoMhAuYZtnGGjAffsJJPxs3sHk", "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe", "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh"}.issubset(gateway.policy_engine.policy.allowed_destinations)


def test_default_gateway_adds_xrpl_testnet_destination_to_whitelist(monkeypatch):
    monkeypatch.setenv("XRPL_TESTNET_DESTINATION", "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe")

    gateway = create_default_gateway()

    assert "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe" in gateway.policy_engine.policy.allowed_destinations
    assert {"rnAo7npmjoMhAuYZtnGGjAffsJJPxs3sHk", "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe", "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh"}.issubset(gateway.policy_engine.policy.allowed_destinations)

def test_preview_returns_decision_and_request_hash_and_no_token_created():
    client, gateway = make_client()
    before = len(gateway.token_issuer.issued_jti)
    resp = client.post("/execution/preview", json=_base_payload())
    assert resp.status_code == 200
    body = resp.json()
    assert body["decision"] in {"APPROVED", "BLOCKED", "CONDITIONAL_APPROVAL"}
    assert body["request_hash"]
    after = len(gateway.token_issuer.issued_jti)
    assert after == before


def test_execution_request_approved_returns_token_and_tx_payload():
    client, _ = make_client()
    resp = client.post("/execution/request", json=_base_payload(amount=20))
    assert resp.status_code == 200
    body = resp.json()
    assert body["decision"] == "APPROVED"
    assert body["token_id"] is not None
    assert body["tx_payload"] is not None
    assert body["approval_id"] is None
    assert body["audit_receipt"]["tx_hash"] == body["tx_hash"]
    assert body["audit_receipt_hash"]
    assert "signer_seed" not in str(body["audit_receipt"])




def test_execution_request_xrp_builds_native_drops_amount_string():
    client, _ = make_client()
    payload = _base_payload(amount=1000000)
    payload["currency"] = "XRP"

    resp = client.post("/execution/request", json=payload)
    assert resp.status_code == 200
    body = resp.json()
    assert body["decision"] == "APPROVED"
    assert body["tx_payload"] is not None
    assert body["tx_payload"]["Amount"] == "1000000"
    assert isinstance(body["tx_payload"]["Amount"], str)

def test_execution_request_blocked_returns_no_token_no_tx_payload():
    client, _ = make_client()
    resp = client.post("/execution/request", json=_base_payload(destination="rBlocked"))
    assert resp.status_code == 200
    body = resp.json()
    assert body["decision"] == "BLOCKED"
    assert body["token_id"] is None
    assert body["tx_payload"] is None
    assert body["audit_receipt"]["submit_status"] == "BLOCKED"


def test_conditional_approval_request_then_confirm_and_replay_protection():
    client = TestClient(create_app())
    payload = {
        "agent_id": "did:openentry:agent:treasury-01",
        "action": "xrpl_payment",
        "amount": 1000000,
        "currency": "XRP",
        "destination": "rnAo7npmjoMhAuYZtnGGjAffsJJPxs3sHk",
        "purpose": "treasury",
        "signer_seed": "sTEST",
    }
    payload["context"] = {"source": "test", "after_hours_execution": True, "frequency_spike": True}
    high_risk = client.post("/execution/request", json=payload)
    body = high_risk.json()
    assert body["decision"] == "CONDITIONAL_APPROVAL"
    assert body["submit_status"] == "PENDING_CONFIRMATION"
    assert body["tx_hash"] is None
    assert body["transient_token_id"] is not None
    assert body["audit_receipt"]["tx_hash"] is None
    assert body["audit_receipt"]["confirmed_at"] is None

    confirm_resp = client.post("/execution/confirm", json={"transient_token_id": body["transient_token_id"], "confirm": True})
    assert confirm_resp.status_code == 200
    confirm_body = confirm_resp.json()
    assert confirm_body["submit_status"] in {"SUBMITTED", "FAILED", "MOCK"}
    if confirm_body["submit_status"] == "SUBMITTED":
        assert confirm_body["audit_receipt"]["tx_hash"] == confirm_body["tx_hash"]

    replay_resp = client.post("/execution/confirm", json={"transient_token_id": body["transient_token_id"], "confirm": True})
    assert replay_resp.status_code == 200
    replay_body = replay_resp.json()
    assert replay_body["submit_status"] == "REJECTED"
    assert replay_body["reason"] == "replay_attack_detected"


def test_conditional_approval_cancel():
    client = TestClient(create_app())
    payload = {
        "agent_id": "did:openentry:agent:treasury-01",
        "action": "xrpl_payment",
        "amount": 1000000,
        "currency": "XRP",
        "destination": "rnAo7npmjoMhAuYZtnGGjAffsJJPxs3sHk",
        "purpose": "treasury",
        "signer_seed": "sTEST",
    }
    payload["context"] = {"source": "test", "after_hours_execution": True, "frequency_spike": True}
    first = client.post("/execution/request", json=payload).json()
    cancel_resp = client.post("/execution/confirm", json={"transient_token_id": first["transient_token_id"], "confirm": False})
    cancel_body = cancel_resp.json()
    assert cancel_body["submit_status"] == "USER_REJECTED"
    assert cancel_body["tx_hash"] is None




def test_conditional_confirm_expired_token_rejected():
    client = TestClient(create_app())
    payload = {
        "agent_id": "did:openentry:agent:treasury-01",
        "action": "xrpl_payment",
        "amount": 1000000,
        "currency": "XRP",
        "destination": "rnAo7npmjoMhAuYZtnGGjAffsJJPxs3sHk",
        "purpose": "treasury",
        "signer_seed": "sTEST",
        "context": {"source": "test", "after_hours_execution": True, "frequency_spike": True},
    }
    first = client.post("/execution/request", json=payload).json()
    client.app.state.pending_confirmations[first["transient_token_id"]]["expires_at"] = 0
    expired = client.post("/execution/confirm", json={"transient_token_id": first["transient_token_id"], "confirm": True}).json()
    assert expired["submit_status"] == "REJECTED"
    assert expired["reason"] == "expired_token"


def test_execution_request_high_risk_blocked_without_token():
    client = TestClient(create_app())
    payload = {
        "agent_id": "did:openentry:agent:treasury-01",
        "action": "xrpl_payment",
        "amount": 1000000,
        "currency": "XRP",
        "destination": "rnAo7npmjoMhAuYZtnGGjAffsJJPxs3sHk",
        "purpose": "treasury",
        "signer_seed": "sTEST",
        "context": {
            "source": "test",
            "after_hours_execution": True,
            "frequency_spike": True,
            "split_transaction_risk": True,
        },
    }
    body = client.post("/execution/request", json=payload).json()
    assert body["decision"] == "BLOCKED"
    assert body["tx_hash"] is None
    assert body["transient_token_id"] is None
def test_audit_anchor_returns_merkle_root_and_record_count():
    client, _ = make_client()
    client.post("/execution/request", json=_base_payload())

    resp = client.get("/audit/anchor")
    assert resp.status_code == 200
    body = resp.json()
    assert body["merkle_root"]
    assert body["record_count"] >= 1


def test_execution_preview_xrp_drops_is_normalized_for_policy():
    client, _ = make_client()
    payload = _base_payload(amount="1000000", destination="rnAo7npmjoMhAuYZtnGGjAffsJJPxs3sHk")
    payload["currency"] = "XRP"

    resp = client.post("/execution/preview", json=payload)
    assert resp.status_code == 200
    body = resp.json()
    assert body["decision"] == "APPROVED"
    assert "requested=1000000.0" not in str(body.get("reason"))


def test_execution_request_xrp_drops_is_normalized_for_policy_and_tx_keeps_raw():
    client, _ = make_client()
    payload = _base_payload(amount="1000000", destination="rnAo7npmjoMhAuYZtnGGjAffsJJPxs3sHk")
    payload["currency"] = "XRP"

    resp = client.post("/execution/request", json=payload)
    assert resp.status_code == 200
    body = resp.json()
    assert body["decision"] == "APPROVED"
    assert body["tx_payload"]["Amount"] == "1000000"
    assert "requested=1000000.0" not in str(body.get("reason"))


def test_preview_demo_risk_mode_returns_simulated_risk_and_stays_approved():
    client, _ = make_client()
    payload = _base_payload(amount=1000000)
    payload["currency"] = "XRP"
    payload["context"] = {
        "source": "web_demo",
        "demo_risk_mode": True,
        "simulated_flags": ["new_destination", "after_hours_execution"],
        "simulated_risk_score": 40,
    }
    resp = client.post("/execution/preview", json=payload)
    assert resp.status_code == 200
    body = resp.json()
    assert body["decision"] == "APPROVED"
    assert body["risk_score"] == 40
    assert body["risk_flags"] == ["new_destination", "after_hours_execution"]


def test_execution_request_demo_risk_mode_includes_risk_and_submit_fields():
    client, _ = make_client()
    payload = _base_payload(amount=1000000)
    payload["currency"] = "XRP"
    payload["context"] = {
        "source": "web_demo",
        "demo_risk_mode": True,
        "simulated_flags": ["new_destination", "after_hours_execution"],
        "simulated_risk_score": 40,
    }
    resp = client.post("/execution/request", json=payload)
    assert resp.status_code == 200
    body = resp.json()
    assert body["decision"] == "APPROVED"
    assert body["risk_score"] == 40
    assert body["risk_flags"] == ["new_destination", "after_hours_execution"]
    assert body["submit_status"] in {"MOCK", "SUBMITTED"}


def test_execution_request_invalid_signer_seed_blocked():
    client, _ = make_client()
    payload = _base_payload()
    payload["signer_seed"] = "badseed"
    body = client.post("/execution/request", json=payload).json()
    assert body["decision"] == "BLOCKED"
    assert body["reason"] == "invalid_signer_seed"
    assert body["risk_score"] == 100
    assert "signer_seed" not in body


def test_preview_binding_exists_shows_signer_and_binding_state():
    client, _ = make_client()
    body = client.post("/execution/preview", json=_base_payload()).json()
    assert body["decision"] in {"APPROVED", "CONDITIONAL_APPROVAL", "BLOCKED"}
    assert body["did_binding_check"] is True
    assert body["signer_account"] == "rGEB4qm9SKvuJVuA4Yh5VgEsV9vy9ofZY6"
    assert "rGEB4qm9SKvuJVuA4Yh5VgEsV9vy9ofZY6" in body["allowed_accounts"]


def test_execution_request_unbound_signer_with_non_strict_binding_proceeds(monkeypatch):
    client, _ = make_client()

    class _OtherWallet:
        classic_address = "rNotAllowedAddress123"

    monkeypatch.setattr("xrpl.wallet.Wallet.from_seed", lambda seed: _OtherWallet())
    body = client.post("/execution/request", json=_base_payload()).json()
    assert body["decision"] in {"APPROVED", "CONDITIONAL_APPROVAL"}
    assert body["reason"] not in {"signer_not_bound_to_did", "invalid_signer_seed", "unknown_agent"}
    assert body["did_binding_check"] is False
    assert body["strict_binding_required"] is False
    assert body["signer_account"] == "rNotAllowedAddress123"
    assert isinstance(body["allowed_accounts"], list)
    assert "signer_seed" not in body


def test_execution_request_unbound_signer_with_strict_binding_blocked(monkeypatch):
    client, _ = make_client()

    class _OtherWallet:
        classic_address = "rNotAllowedAddress123"

    monkeypatch.setattr("xrpl.wallet.Wallet.from_seed", lambda seed: _OtherWallet())
    original_safe_load = yaml.safe_load

    def _safe_load_with_strict(stream):
        data = original_safe_load(stream) or {}
        data.setdefault("did_binding_policy", {})
        data["did_binding_policy"]["strict_binding_required"] = True
        return data

    monkeypatch.setattr(api_module._module.yaml, "safe_load", _safe_load_with_strict)
    body = client.post("/execution/request", json=_base_payload()).json()
    assert body["decision"] == "BLOCKED"
    assert body["reason"] == "signer_not_bound_to_did"
    assert body["risk_score"] == 100
    assert body["risk_flags"] == ["signer_not_bound_to_did"]
    assert body["submit_status"] == "BLOCKED"
    assert body["tx_hash"] is None
    assert body["did_binding_check"] is False
    assert body["strict_binding_required"] is True
    assert body["signer_account"] == "rNotAllowedAddress123"
    assert "signer_seed" not in body


def test_preview_response_never_leaks_signer_seed():
    client, _ = make_client()
    body = client.post("/execution/preview", json=_base_payload()).json()
    assert "signer_seed" not in body


def test_approved_uses_signer_seed_submit_helper(monkeypatch):
    client, _ = make_client()
    monkeypatch.setenv("USE_XRPL_SUBMIT", "true")

    called = {}

    def _fake_submit(tx_payload, *, signer_seed=None, endpoint=None):
        called["seed"] = signer_seed
        return {"success": True, "tx_hash": "ABC123"}

    monkeypatch.setattr("agentguard.api._module.submit_xrpl_transaction", _fake_submit)
    body = client.post("/execution/request", json=_base_payload(amount=20, destination="rnAo7npmjoMhAuYZtnGGjAffsJJPxs3sHk")).json()
    assert body["decision"] == "APPROVED"
    assert body["submit_status"] == "SUBMITTED"
    assert body["tx_hash"] == "ABC123"
    assert called["seed"] == "sTEST"


def test_approved_missing_signer_seed_and_no_fallback_fails(monkeypatch):
    client, _ = make_client()
    monkeypatch.delenv("XRPL_TESTNET_SEED", raising=False)
    payload = _base_payload()
    payload["signer_seed"] = None
    body = client.post("/execution/request", json=payload).json()
    assert body["submit_status"] == "BLOCKED"
    assert body["reason"] == "invalid_signer_seed"


def test_conditional_confirm_uses_same_submit_helper(monkeypatch):
    client = TestClient(create_app())
    monkeypatch.setenv("USE_XRPL_SUBMIT", "true")
    payload = _base_payload(amount=1000000, destination="rnAo7npmjoMhAuYZtnGGjAffsJJPxs3sHk")
    payload["currency"] = "XRP"
    payload["action"] = "xrpl_payment"
    payload["purpose"] = "treasury"
    payload["context"] = {"source": "test", "after_hours_execution": True, "frequency_spike": True}
    first = client.post("/execution/request", json=payload).json()
    assert first["decision"] == "CONDITIONAL_APPROVAL"

    called = {}

    def _fake_submit(tx_payload, *, signer_seed=None, endpoint=None):
        called["seed"] = signer_seed
        return {"success": True, "tx_hash": "COND123"}

    monkeypatch.setattr("agentguard.api._module.submit_xrpl_transaction", _fake_submit)
    confirm = client.post("/execution/confirm", json={"transient_token_id": first["transient_token_id"], "confirm": True, "signer_seed": "sTEST"}).json()
    assert confirm["submit_status"] == "SUBMITTED"
    assert confirm["tx_hash"] == "COND123"
    assert called["seed"] == "sTEST"


def test_confirm_response_never_leaks_signer_seed(monkeypatch):
    client = TestClient(create_app())
    payload = _base_payload(amount=1000000)
    payload["currency"] = "XRP"
    payload["action"] = "xrpl_payment"
    payload["purpose"] = "treasury"
    payload["context"] = {"source": "test", "after_hours_execution": True, "frequency_spike": True}
    first = client.post("/execution/request", json=payload).json()
    body = client.post("/execution/confirm", json={"transient_token_id": first["transient_token_id"], "confirm": False, "signer_seed": "sTEST"}).json()
    assert "signer_seed" not in str(body)
