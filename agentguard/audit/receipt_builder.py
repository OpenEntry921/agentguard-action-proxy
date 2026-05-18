import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


def build_audit_receipt(
    *,
    decision_id: Optional[str],
    request_hash: Optional[str],
    policy_id: Optional[str],
    policy_version: Optional[str],
    policy_hash: Optional[str],
    agent_id: Optional[str],
    signer_account: Optional[str],
    action: Optional[str],
    purpose: Optional[str],
    destination: Optional[str],
    amount_drops: Optional[int],
    currency: Optional[str],
    decision: Optional[str],
    risk_score: Optional[int],
    risk_flags: Optional[List[str]],
    reason: Optional[str],
    submit_status: Optional[str],
    tx_hash: Optional[str],
    runtime_mode: Optional[str],
    xrpl_lookup_mode: Optional[str],
    created_at: Optional[str] = None,
    confirmed_by: Optional[str] = None,
    confirmed_at: Optional[str] = None,
    rejected_at: Optional[str] = None,
) -> Dict[str, Any]:
    return {
        "receipt_id": str(uuid.uuid4()),
        "decision_id": decision_id,
        "request_hash": request_hash,
        "policy_id": policy_id,
        "policy_version": policy_version,
        "policy_hash": policy_hash,
        "agent_id": agent_id,
        "signer_account": signer_account,
        "action": action,
        "purpose": purpose,
        "destination": destination,
        "amount_drops": amount_drops,
        "currency": currency,
        "decision": decision,
        "risk_score": risk_score,
        "risk_flags": risk_flags or [],
        "reason": reason,
        "submit_status": submit_status,
        "tx_hash": tx_hash,
        "runtime_mode": runtime_mode,
        "xrpl_lookup_mode": xrpl_lookup_mode,
        "created_at": created_at or datetime.now(timezone.utc).isoformat(),
        "confirmed_by": confirmed_by,
        "confirmed_at": confirmed_at,
        "rejected_at": rejected_at,
    }


class AuditReceiptBuilder:
    def build_receipt(self, **kwargs: Any) -> Dict[str, Any]:
        return build_audit_receipt(**kwargs)
