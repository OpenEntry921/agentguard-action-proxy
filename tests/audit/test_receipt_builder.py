from agentguard.audit import compute_audit_receipt_hash
from agentguard.audit import build_audit_receipt


def test_receipt_builder_success():
    receipt = build_audit_receipt(
        decision_id="d1", request_hash="r1", policy_id="pid", policy_version="v1", policy_hash="p1", agent_id="did:1",
        signer_account="rDest", action="pay", purpose="ops", destination="rDest", amount_drops=100, currency="XRP",
        decision="APPROVED", risk_score=0, risk_flags=["f1"], reason="ok", submit_status="SUBMITTED", tx_hash="ABC",
        runtime_mode="LIVE", xrpl_lookup_mode="LIVE",
    )
    assert receipt["decision_id"] == "d1"
    assert receipt["decision"] == "APPROVED"


def test_audit_receipt_hash_deterministic_and_excludes_self_hash():
    receipt = build_audit_receipt(
        decision_id="d1", request_hash="r1", policy_id="pid", policy_version="v1", policy_hash="p1", agent_id="did:1",
        signer_account="rDest", action="pay", purpose="ops", destination="rDest", amount_drops=100, currency="XRP",
        decision="APPROVED", risk_score=0, risk_flags=[], reason="ok", submit_status="SUBMITTED", tx_hash="ABC",
        runtime_mode="LIVE", xrpl_lookup_mode="LIVE",
    )
    h1 = compute_audit_receipt_hash(receipt)
    receipt["audit_receipt_hash"] = "tampered"
    h2 = compute_audit_receipt_hash(receipt)
    assert h1 == h2
