from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class Decision(str, Enum):
    ALLOW = "ALLOW"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    DENY = "DENY"


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ActionRequest(BaseModel):
    action_id: str
    actor_type: Literal["user", "ai_agent", "system"]
    actor_id: str
    action_type: str
    target_system: str
    target_resource: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    context: Dict[str, Any] = Field(default_factory=dict)
    requested_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PreviewResponse(BaseModel):
    action_id: str
    interpreted_action_meaning: str
    risk_score: int
    risk_level: RiskLevel
    matched_policies: List[str]
    decision: Decision
    reason: str
    approval_required: bool


class ApprovalResponse(BaseModel):
    action_id: str
    status: Literal["approved", "denied"]


class ExecuteRequest(BaseModel):
    action_request: ActionRequest
    execution_token: str


class ExecutionResult(BaseModel):
    action_id: str
    decision: str
    executed: bool
    message: str
    executor: str


class EphemeralExecutionToken(BaseModel):
    token_id: str
    action_id: str
    allowed_action_type: str
    allowed_target: str
    expires_at: datetime
    used: bool = False
