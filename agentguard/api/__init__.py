import importlib.util
import os
from pathlib import Path
from typing import Optional, Any

from agentguard.gateway import AgentGuardGateway
from agentguard.policy import Policy

_api_path = Path(__file__).resolve().parents[1] / "api.py"
_spec = importlib.util.spec_from_file_location("agentguard_action_proxy_api", str(_api_path))
_module = importlib.util.module_from_spec(_spec)
assert _spec is not None and _spec.loader is not None
_spec.loader.exec_module(_module)

app = _module.app


class _TokenIssuerAdapter:
    """Compatibility wrapper exposing legacy `issued_jti` semantics."""

    def __init__(self, gateway: AgentGuardGateway):
        self._gateway = gateway

    @property
    def issued_jti(self) -> set[str]:
        issued: set[str] = set()
        for record in getattr(self._gateway.audit_log, "records", []):
            token_id = getattr(record, "token_id", None)
            if token_id:
                issued.add(token_id)
        return issued


class LegacyGatewayCompatibilityAdapter:
    """Lightweight shim for tests expecting the old gateway attributes."""

    def __init__(self, gateway: AgentGuardGateway):
        self._gateway = gateway
        self.policy_engine = gateway.policy_engine
        self.token_issuer = _TokenIssuerAdapter(gateway)


_DEFAULT_ALLOWED_DESTINATIONS = {
    "rnAo7npmjoMhAuYZtnGGjAffsJJPxs3sHk",
    "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe",
    "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
}


def create_default_gateway() -> Any:
    """Return a compatibility gateway object for legacy imports/tests."""

    allowed_destinations = set(_DEFAULT_ALLOWED_DESTINATIONS)
    testnet_destination = os.getenv("XRPL_TESTNET_DESTINATION")
    if testnet_destination:
        allowed_destinations.add(testnet_destination)

    gateway = AgentGuardGateway(
        Policy(
            max_amount=1_000_000_000,
            allowed_merchants={"*"},
            allowed_purposes={"ops", "treasury", "vendor", "*"},
            allowed_actions={"pay", "xrpl_payment", "*"},
            allowed_destinations=allowed_destinations,
            daily_limit=None,
        )
    )
    return LegacyGatewayCompatibilityAdapter(gateway)


def create_app(_gateway: Optional[Any] = None):
    """Return the FastAPI app instance (legacy-compatible signature)."""

    return app


__all__ = ["app", "create_app", "create_default_gateway", "LegacyGatewayCompatibilityAdapter"]
