from typing import Any


class DIDAdapter:
    """Connects DID resolution to AgentGuard execution flow."""

    def __init__(self, resolver):
        self.resolver = resolver

    def get_agent_identity(self, did: str) -> dict[str, Any]:
        doc = self.resolver.resolve(did)

        return {
            "did": doc.id,
            "controller": doc.controller,
            "verificationMethod": doc.verification_method,
            "service": doc.service,
            "source": doc.source,
        }
