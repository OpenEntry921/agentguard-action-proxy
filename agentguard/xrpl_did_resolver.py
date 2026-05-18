from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class XRPLDIDDocument:
    """Resolved XRPL DID Document placeholder."""
    id: str
    controller: str
    verification_method: list[dict[str, Any]]
    service: list[dict[str, Any]]
    source: str = "xrpl_stub"


class XRPLDIDResolver:
    """XRPL DID Resolver Stub.

    This is a design stub, not a real XRPL ledger client.

    Production implementation should:
    - use xrpl-py or xrpl.js,
    - query XRPL DID ledger objects,
    - resolve the DID Document URI or embedded data,
    - verify controller and verification methods,
    - support DID updates and revocation where applicable.
    """

    def __init__(self, network: str = "testnet"):
        self.network = network

    def resolve(self, did: str) -> XRPLDIDDocument:
        if not did.startswith("did:xrpl:"):
            raise ValueError(f"not an XRPL DID: {did}")

        account = did.replace("did:xrpl:", "", 1)

        return XRPLDIDDocument(
            id=did,
            controller=account,
            verification_method=[
                {
                    "id": f"{did}#key-1",
                    "type": "Ed25519VerificationKey2020",
                    "controller": did,
                    "publicKeyMultibase": "zStubPublicKeyReplaceWithXRPLResolvedKey",
                }
            ],
            service=[
                {
                    "id": f"{did}#agentguard-gateway",
                    "type": "AgentGuardActionGateway",
                    "serviceEndpoint": "https://gateway.agentguard.local",
                }
            ],
        )
