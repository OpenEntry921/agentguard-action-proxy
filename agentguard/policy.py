from dataclasses import dataclass, field
from typing import Any, Optional


def _to_amount_raw_string(amount: Any) -> str:
    if isinstance(amount, str):
        return amount
    if isinstance(amount, int):
        return str(amount)
    if isinstance(amount, float):
        if amount.is_integer():
            return str(int(amount))
        return str(amount)
    return str(amount)


def normalize_amount_for_policy(amount: Any, currency: str) -> tuple[float, str]:
    raw = _to_amount_raw_string(amount)
    numeric = float(amount)
    if currency == "XRP":
        return numeric / 1_000_000, raw
    return numeric, raw


@dataclass(frozen=True)
class Policy:
    """MVP policy model.

    Production version should compile Rego/Cedar policies.
    """
    max_amount: float
    allowed_merchants: set[str] = field(default_factory=set)
    allowed_destinations: set[str] = field(default_factory=set)
    allowed_purposes: set[str] = field(default_factory=set)
    allowed_actions: set[str] = field(default_factory=set)
    daily_limit: Optional[float] = None


class PolicyEngine:
    """Layer 1: Policy-Embedded Identity.

    Checks action context, not just authentication.
    """

    def __init__(self, policy: Policy):
        self.policy = policy

    def check_policy(self, request: dict[str, Any]) -> tuple[bool, str]:
        amount, _ = normalize_amount_for_policy(request.get("amount", 0), str(request.get("currency", "")))
        merchant = request.get("merchant", "")
        purpose = request.get("purpose", "")
        action = request.get("action", "")

        if amount <= 0:
            return False, "amount must be positive"

        if amount > self.policy.max_amount:
            return False, f"amount exceeds policy: requested={amount}, max={self.policy.max_amount}"

        if self.policy.allowed_merchants and merchant not in self.policy.allowed_merchants:
            return False, f"merchant not allowed: {merchant}"

        if self.policy.allowed_purposes and purpose not in self.policy.allowed_purposes:
            return False, f"purpose not allowed: {purpose}"

        if self.policy.allowed_actions and action not in self.policy.allowed_actions:
            return False, f"action not allowed: {action}"

        return True, "policy_ok"
