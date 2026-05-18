from dataclasses import dataclass
from typing import Any, Optional

from .gateway import AgentGuardGateway
from .token import ActionToken


@dataclass
class ProxyResult:
    ok: bool
    message: str
    external_response: Optional[dict[str, Any]] = None


class MockExternalAPI:
    """Mock external API.

    In production, this would be Stripe, a PG, ERP API, SaaS API, or bank/broker API.
    The real API key would be stored in Vault/Secrets Manager and only used by this proxy.
    """

    def __init__(self, api_key: str):
        self._api_key = api_key

    def charge(self, request: dict[str, Any]) -> dict[str, Any]:
        # Never expose _api_key to the agent.
        return {
            "status": "charged",
            "merchant": request.get("merchant"),
            "amount": request.get("amount"),
            "purpose": request.get("purpose"),
            "api_key_used_by_proxy": self._api_key[:4] + "***",
        }


class ExecutionProxy:
    """Layer 2 runtime proxy.

    Agent brings an ActionToken.
    Proxy verifies the token and performs the actual external call.
    """

    def __init__(self, gateway: AgentGuardGateway, external_api: MockExternalAPI):
        self.gateway = gateway
        self.external_api = external_api

    def execute_payment(self, token: ActionToken) -> ProxyResult:
        if token is None:
            return ProxyResult(ok=False, message="INVALID_TOKEN")
        valid, reason = self.gateway.consume_token_for_execution(token)

        if not valid:
            return ProxyResult(ok=False, message=f"token rejected: {reason}")

        request = token.payload["action"]
        response = self.external_api.charge(request)

        return ProxyResult(ok=True, message="executed", external_response=response)
