from datetime import datetime, timedelta, timezone
from uuid import uuid4

from agentguard.models import ActionRequest, EphemeralExecutionToken


class TokenService:
    def __init__(self) -> None:
        self._tokens: dict[str, EphemeralExecutionToken] = {}

    def issue(self, action: ActionRequest, ttl_seconds: int = 120) -> EphemeralExecutionToken:
        token = EphemeralExecutionToken(
            token_id=str(uuid4()),
            action_id=action.action_id,
            allowed_action_type=action.action_type,
            allowed_target=action.target_resource,
            expires_at=datetime.now(timezone.utc) + timedelta(seconds=ttl_seconds),
            used=False,
        )
        self._tokens[token.token_id] = token
        return token

    def validate_for_execution(self, token_id: str, action: ActionRequest) -> tuple[bool, str]:
        token = self._tokens.get(token_id)
        if not token:
            return False, "token_not_found"
        if token.expires_at < datetime.now(timezone.utc):
            return False, "token_expired"
        if token.used:
            return False, "token_already_used"
        if token.action_id != action.action_id:
            return False, "action_id_mismatch"
        if token.allowed_action_type != action.action_type:
            return False, "action_type_mismatch"
        if token.allowed_target != action.target_resource:
            return False, "target_mismatch"
        token.used = True
        return True, "token_valid"
