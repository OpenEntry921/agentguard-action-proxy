
import json
from pathlib import Path
from typing import Union

from .policy import Policy

def load_policy_from_json(path: Union[str, Path]) -> Policy:
    """Load MVP JSON policy.

    This is intentionally simple. In production, replace with OPA/Rego or Cedar.
    """
    data = json.loads(Path(path).read_text(encoding="utf-8"))

    return Policy(
        max_amount=float(data["max_amount"]),
        allowed_merchants=set(data.get("allowed_merchants", [])),
        allowed_destinations=set(data.get("allowed_destinations", [])),
        allowed_purposes=set(data.get("allowed_purposes", [])),
        allowed_actions=set(data.get("allowed_actions", [])),
        daily_limit=float(data["daily_limit"]) if data.get("daily_limit") is not None else None,
    )
