import time
from dataclasses import dataclass
from uuid import uuid4


@dataclass(frozen=True)
class Challenge:
    challenge: str
    domain: str
    verifier_did: str
    expires_at: int
    type: str = "agent_action_request"


class ChallengeService:
    """Generates domain-bound one-time challenges for Action Presentations."""

    def __init__(self, verifier_did: str, domain: str):
        self.verifier_did = verifier_did
        self.domain = domain

    def generate(self, expires_in_seconds: int = 300) -> Challenge:
        domain_prefix = self.domain.split(".")[0]
        return Challenge(
            challenge=f"{domain_prefix}-{uuid4()}",
            domain=self.domain,
            verifier_did=self.verifier_did,
            expires_at=int(time.time()) + expires_in_seconds,
        )
