import time
from dataclasses import dataclass, asdict
from typing import Any, Optional
from uuid import uuid4

from cryptography.exceptions import InvalidSignature

from .crypto import canonical_json, b64e, b64d


@dataclass(frozen=True)
class VerifiableCredential:
    """Minimal W3C-style Verifiable Credential for AgentGuard.

    Adapted from a traditional Issuer/Holder/Verifier VC flow:
    - Issuer: Organization / Policy Issuer
    - Holder: AI Agent DID
    - Verifier: Execution Gateway
    """
    context: list[str]
    id: str
    type: list[str]
    issuer: str
    issuanceDate: str
    expirationDate: Optional[str]
    credentialSubject: dict[str, Any]


@dataclass(frozen=True)
class VerifiablePresentation:
    """Minimal Verifiable Presentation for proving Agent permission to a gateway."""
    context: list[str]
    type: list[str]
    holder: str
    verifiableCredential: list[dict[str, Any]]
    challenge: str
    domain: str
    created: int


class PolicyVCIssuer:
    """Issues policy-bound VCs to AI Agent DIDs."""

    def __init__(self, issuer_did: str, issuer_private_key):
        self.issuer_did = issuer_did
        self.private_key = issuer_private_key

    def issue_policy_vc(
        self,
        agent_did: str,
        policy_ref: str,
        claims: dict[str, Any],
        ttl_seconds: int = 3600,
    ) -> dict[str, Any]:
        now = int(time.time())
        vc = VerifiableCredential(
            context=[
                "https://www.w3.org/2018/credentials/v1",
                "https://agentguard.openentry.io/credentials/v1",
            ],
            id=f"urn:agentguard:vc:{uuid4()}",
            type=["VerifiableCredential", "AgentPolicyCredential"],
            issuer=self.issuer_did,
            issuanceDate=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now)),
            expirationDate=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now + ttl_seconds)),
            credentialSubject={
                "id": agent_did,
                "policyRef": policy_ref,
                "allowedActions": claims.get("allowed_actions", []),
                "maxAmount": claims.get("max_amount"),
                "allowedMerchants": claims.get("allowed_merchants", []),
                "allowedPurposes": claims.get("allowed_purposes", []),
                "delegatedBy": claims.get("delegated_by"),
            },
        )

        payload = asdict(vc)
        # JSON-LD normally uses "@context"; Python dataclass uses context for simplicity.
        payload["@context"] = payload.pop("context")

        signature = self.private_key.sign(canonical_json(payload))

        return {
            "credential": payload,
            "proof": {
                "type": "Ed25519Signature2020",
                "proofPurpose": "assertionMethod",
                "verificationMethod": f"{self.issuer_did}#key-1",
                "created": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now)),
                "jws": b64e(signature),
            },
        }


class ActionPresentationBuilder:
    """Builds a VP proving that an AI Agent holds a policy credential.

    This adapts the legacy domain/challenge model:
    - Verifier domain = execution gateway domain
    - Challenge = one-time execution challenge
    """

    def __init__(self, holder_agent_did: str, holder_private_key):
        self.holder_agent_did = holder_agent_did
        self.private_key = holder_private_key

    def create_presentation(
        self,
        credentials: list[dict[str, Any]],
        challenge: str,
        domain: str,
    ) -> dict[str, Any]:
        now = int(time.time())
        vp = VerifiablePresentation(
            context=[
                "https://www.w3.org/2018/credentials/v1",
                "https://agentguard.openentry.io/presentations/v1",
            ],
            type=["VerifiablePresentation", "AgentActionPresentation"],
            holder=self.holder_agent_did,
            verifiableCredential=credentials,
            challenge=challenge,
            domain=domain,
            created=now,
        )

        payload = asdict(vp)
        payload["@context"] = payload.pop("context")

        signature = self.private_key.sign(canonical_json(payload))

        return {
            "presentation": payload,
            "proof": {
                "type": "Ed25519Signature2020",
                "proofPurpose": "authentication",
                "verificationMethod": f"{self.holder_agent_did}#key-1",
                "created": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now)),
                "challenge": challenge,
                "domain": domain,
                "jws": b64e(signature),
            },
        }


class PresentationVerifier:
    """Minimal verifier for challenge/domain binding.

    Production version should:
    - resolve DID Documents,
    - verify issuer VC signatures,
    - verify holder VP signatures,
    - check credential status and revocation,
    - check policy claims against requested action.
    """

    def __init__(self, expected_domain: str):
        self.expected_domain = expected_domain
        self.used_challenges: set[str] = set()

    def verify_presentation_envelope(self, vp_envelope: dict[str, Any]) -> tuple[bool, str]:
        presentation = vp_envelope.get("presentation", {})
        proof = vp_envelope.get("proof", {})

        challenge = proof.get("challenge")
        domain = proof.get("domain")

        if not challenge:
            return False, "missing_challenge"

        if challenge in self.used_challenges:
            return False, "challenge_replay_detected"

        if domain != self.expected_domain:
            return False, f"domain_mismatch: expected={self.expected_domain}, got={domain}"

        if presentation.get("challenge") != challenge:
            return False, "presentation_challenge_mismatch"

        if presentation.get("domain") != domain:
            return False, "presentation_domain_mismatch"

        self.used_challenges.add(challenge)
        return True, "presentation_envelope_ok"
