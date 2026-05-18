import copy
import hashlib
import json
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

SENSITIVE_KEYS = {"signer_seed", "seed", "private_key", "secret", "raw_seed"}
AUDIT_LOG_PATH = Path("logs") / "audit_receipts.jsonl"


def sanitize_for_audit(payload: Any) -> Any:
    if isinstance(payload, dict):
        cleaned: Dict[str, Any] = {}
        for key, value in payload.items():
            if str(key).lower() in SENSITIVE_KEYS:
                continue
            cleaned[key] = sanitize_for_audit(value)
        return cleaned
    if isinstance(payload, list):
        return [sanitize_for_audit(item) for item in payload]
    return payload


def canonical_json_bytes(payload: Any) -> bytes:
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def sha256_hex(payload: Any) -> str:
    return hashlib.sha256(canonical_json_bytes(payload)).hexdigest()


def compute_request_hash(request_payload: Dict[str, Any]) -> str:
    return sha256_hex(sanitize_for_audit(request_payload))


def compute_policy_hash(policy_payload: Dict[str, Any]) -> str:
    return sha256_hex(copy.deepcopy(policy_payload))


def compute_audit_receipt_hash(receipt: Dict[str, Any]) -> str:
    receipt_copy = dict(receipt)
    receipt_copy.pop("audit_receipt_hash", None)
    return sha256_hex(receipt_copy)


def build_audit_receipt(**kwargs: Any) -> Dict[str, Any]:
    base = {
        "receipt_id": str(uuid.uuid4()),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "confirmed_by": None,
        "confirmed_at": None,
        "rejected_at": None,
        "risk_flags": [],
    }
    base.update(kwargs)
    return base


class AuditReceiptBuilder:
    def build_receipt(self, **kwargs: Any) -> Dict[str, Any]:
        return build_audit_receipt(**kwargs)


def append_audit_receipt(receipt: Dict[str, Any], path: Path = AUDIT_LOG_PATH) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    sanitized = sanitize_for_audit(receipt)
    with path.open("a", encoding="utf-8") as fp:
        fp.write(json.dumps(sanitized, ensure_ascii=False, sort_keys=True) + "\n")


@dataclass
class AuditRecord:
    status: str
    agent_did: str
    request: Dict[str, Any]
    reason: str
    token_id: Optional[str]
    timestamp: float
    record_hash: str = ""


@dataclass
class MerkleAuditLog:
    records: List[AuditRecord] = field(default_factory=list)

    def record_hash(self, record: AuditRecord) -> str:
        return sha256_hex({
            "status": record.status,
            "agent_did": record.agent_did,
            "request": sanitize_for_audit(record.request),
            "reason": record.reason,
            "token_id": record.token_id,
            "timestamp": record.timestamp,
        })

    def append(self, record: AuditRecord) -> None:
        record.record_hash = self.record_hash(record)
        self.records.append(record)
