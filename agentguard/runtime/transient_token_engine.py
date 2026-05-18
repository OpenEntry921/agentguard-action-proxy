import time
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from agentguard.storage.cache.runtime_cache import InMemoryRuntimeCache, RuntimeCache


class TransientActionTokenEngine:
    def __init__(self, cache: Optional[RuntimeCache] = None, ttl_seconds: int = 60) -> None:
        self.cache = cache or InMemoryRuntimeCache()
        self.ttl_seconds = int(ttl_seconds)

    def issue_token(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        token_id = str(uuid.uuid4())
        token = {
            "token_id": token_id,
            "did": payload.get("did") or payload.get("agent_id"),
            "destination": payload.get("destination"),
            "amount_drops": int(payload.get("amount_drops", payload.get("amount", 0))),
            "currency": payload.get("currency", "XRP"),
            "issued_at": now.isoformat(),
            "expires_at": (now + timedelta(seconds=self.ttl_seconds)).isoformat(),
            "nonce": payload.get("nonce") or str(uuid.uuid4()),
            "policy_id": payload.get("policy_id"),
            "policy_hash": payload.get("policy_hash"),
            "decision_id": payload.get("decision_id") or str(uuid.uuid4()),
            "risk_score": int(payload.get("risk_score", 0)),
            "invalidated": False,
        }
        self.cache.set("token:" + token_id, token)
        return token

    def validate_token(self, token_id: str) -> Dict[str, Any]:
        token = self.cache.get("token:" + token_id)
        if not token:
            return {"valid": False, "reason": "token_not_found"}
        if token.get("invalidated"):
            return {"valid": False, "reason": "replay_attack_detected", "token": token}
        if datetime.fromisoformat(token["expires_at"]).timestamp() <= time.time():
            return {"valid": False, "reason": "expired_token", "token": token}
        return {"valid": True, "token": token}

    def invalidate_token(self, token_id: str) -> None:
        token = self.cache.get("token:" + token_id)
        if token:
            token["invalidated"] = True
            self.cache.set("token:" + token_id, token)
