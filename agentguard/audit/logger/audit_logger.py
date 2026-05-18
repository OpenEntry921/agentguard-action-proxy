from typing import Any, Dict


def append_audit_record(gateway: Any, payload: Dict[str, Any]) -> str:
    return gateway.audit_log.append(payload)
