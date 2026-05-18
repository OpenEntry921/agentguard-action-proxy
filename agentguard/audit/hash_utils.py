import copy
import hashlib
import json
from typing import Any, Dict

SENSITIVE_KEYS = {"signer_seed", "seed", "private_key", "secret", "raw_seed"}


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
