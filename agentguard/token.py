import time
from dataclasses import dataclass
from uuid import uuid4
from typing import Any

from cryptography.exceptions import InvalidSignature

from .crypto import canonical_json, b64e, b64d


@dataclass
class ActionToken:
    payload: dict[str, Any]
    signature: str


class TokenIssuer:
    """Layer 2: Transient Action Token.

    Issues short-lived, action-bound signed tokens.
    """

    def __init__(self, gateway_private_key, gateway_public_key):
        self.private_key = gateway_private_key
        self.public_key = gateway_public_key
        self.used_jtis: set[str] = set()
        self.issued_jti: list[str] = []

    def issue_token(self, agent_did: str, action_details: dict[str, Any], ttl_seconds: int = 60) -> ActionToken:
        payload = {
            "jti": str(uuid4()),
            "sub": agent_did,
            "action": action_details,
            "iat": int(time.time()),
            "exp": int(time.time()) + ttl_seconds,
            "type": "action_token",
        }
        signature = self.private_key.sign(canonical_json(payload))
        self.issued_jti.append(payload["jti"])
        return ActionToken(payload=payload, signature=b64e(signature))

    def verify_token(self, token: ActionToken, consume: bool = True) -> tuple[bool, str]:
        try:
            self.public_key.verify(
                b64d(token.signature),
                canonical_json(token.payload),
            )
        except InvalidSignature:
            return False, "invalid_signature"

        now = int(time.time())
        if token.payload.get("exp", 0) < now:
            return False, "expired"

        jti = token.payload.get("jti")
        if not jti:
            return False, "missing_jti"

        if consume:
            if jti in self.used_jtis:
                return False, "replay_detected"
            self.used_jtis.add(jti)

        return True, "token_ok"
