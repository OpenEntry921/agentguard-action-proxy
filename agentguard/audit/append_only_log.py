import json
from pathlib import Path
from typing import Any, Dict

from agentguard.audit.hash_utils import sanitize_for_audit


AUDIT_LOG_PATH = Path("logs") / "audit_receipts.jsonl"


def append_audit_receipt(receipt: Dict[str, Any], path: Path = AUDIT_LOG_PATH) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    sanitized = sanitize_for_audit(receipt)
    with path.open("a", encoding="utf-8") as fp:
        fp.write(json.dumps(sanitized, ensure_ascii=False, sort_keys=True) + "\n")
