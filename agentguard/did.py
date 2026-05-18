import time
from dataclasses import dataclass, asdict
from typing import Any
from uuid import uuid4

from .crypto import IdentityManager, b64e, canonical_json


@dataclass(frozen=True)
class DIDDocument:
    """Minimal W3C-style DID Document for an AI Agent.

    This is intentionally minimal for MVP.
    Production version should align with W3C DID Core and a concrete DID method.
    """
    id: str
    controller: str
    public_key_multibase: str
    service: list[dict[str, Any]]
    created_at: int


@dataclass(frozen=True)
class PolicyCredential:
    """Policy-bound credential issued to an Agent DID.

    This is not a full W3C Verifiable Credential implementation yet.
    It models the minimum fields needed for policy-bound agent execution.
    """
    id: str
    issuer: str
    subject: str
    policy_ref: str
    claims: dict[str, Any]
    issued_at: int
    expires_at: int


class AgentDIDFactory:
    """Creates Agent DID and minimal DID Document."""

    @staticmethod
    def create_agent_did(
        namespace: str,
        controller_did: str,
        service_endpoint: str = "https://agentguard.local/gateway",
    ) -> tuple[str, DIDDocument, Any, Any]:
        private_key, public_key = IdentityManager.generate_key_pair()
        fingerprint = IdentityManager.public_key_fingerprint(public_key)

        did = f"did:agentguard:{namespace}:{uuid4()}"
        did_doc = DIDDocument(
            id=did,
            controller=controller_did,
            public_key_multibase=f"ed25519:{fingerprint}",
            service=[
                {
                    "id": f"{did}#agentguard-gateway",
                    "type": "AgentGuardActionGateway",
                    "serviceEndpoint": service_endpoint,
                }
            ],
            created_at=int(time.time()),
        )

        return did, did_doc, private_key, public_key


class PolicyCredentialIssuer:
    """Issues signed policy credential for an Agent DID."""

    def __init__(self, issuer_did: str, issuer_private_key):
        self.issuer_did = issuer_did
        self.private_key = issuer_private_key

    def issue_policy_credential(
        self,
        subject_agent_did: str,
        policy_ref: str,
        claims: dict[str, Any],
        ttl_seconds: int = 3600,
    ) -> dict[str, Any]:
        now = int(time.time())
        credential = PolicyCredential(
            id=f"urn:agentguard:credential:{uuid4()}",
            issuer=self.issuer_did,
            subject=subject_agent_did,
            policy_ref=policy_ref,
            claims=claims,
            issued_at=now,
            expires_at=now + ttl_seconds,
        )

        payload = asdict(credential)
        signature = self.private_key.sign(canonical_json(payload))

        return {
            "credential": payload,
            "proof": {
                "type": "Ed25519Signature",
                "created": now,
                "verificationMethod": f"{self.issuer_did}#key-1",
                "signature": b64e(signature),
            },
        }
