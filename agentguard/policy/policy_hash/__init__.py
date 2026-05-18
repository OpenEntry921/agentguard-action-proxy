import hashlib
import json
from typing import Any, Dict


def compute_policy_hash(policy: Dict[str, Any]) -> str:
    canonical = json.dumps(policy, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()
