import hashlib
import hmac
import json
import os
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from agentguard.integrations.github.client import GitHubClient
from agentguard.integrations.github.policies import PolicyDecision, evaluate_github_action


@dataclass
class ExecutionToken:
    agent_id: str
    allowed_action: str
    repo: str
    expires_at: str
    policy_version: str
    signature: str


class GitHubRuntimeExecutor:
    def __init__(self, client: GitHubClient, ttl_seconds: int = 120):
        self.client = client
        self.ttl_seconds = ttl_seconds
        self.signing_key = os.getenv("AGENTGUARD_EXECUTION_SECRET", "agentguard-dev-secret")

    def evaluate_and_mint_token(self, agent_id: str, action: str) -> Dict[str, Any]:
        policy = evaluate_github_action(action)
        if policy.decision != PolicyDecision.ALLOW:
            return {"allowed": False, "policy": asdict(policy), "blocked_before_execution": True}

        expires_at = (datetime.now(timezone.utc) + timedelta(seconds=self.ttl_seconds)).isoformat()
        token_payload = {
            "agent_id": agent_id,
            "allowed_action": action,
            "repo": self.client.repo,
            "expires_at": expires_at,
            "policy_version": policy.policy_version,
        }
        signature = self._sign_payload(token_payload)
        token = ExecutionToken(**token_payload, signature=signature)
        return {"allowed": True, "policy": asdict(policy), "execution_token": asdict(token)}

    def execute(self, intent: Dict[str, Any], token: Dict[str, Any]) -> Dict[str, Any]:
        validation = self._validate_token(intent, token)
        if not validation["ok"]:
            return {"executed": False, "reason": validation["reason"], "blocked_before_execution": True}

        action = intent["action"]
        params = intent.get("params", {})
        if action == "create_branch":
            result = self.client.create_branch(params["branch_name"], params["from_sha"])
        elif action == "create_pr":
            result = self.client.create_pull_request(params["title"], params["head"], params["base"], params.get("body", ""))
        elif action == "modify_workflow":
            return {"executed": False, "reason": "review_required_blocked", "blocked_before_execution": True}
        else:
            return {"executed": False, "reason": "unsupported_action", "blocked_before_execution": True}
        return {"executed": bool(result.get("ok")), "action": action, "result": result}

    def _validate_token(self, intent: Dict[str, Any], token: Dict[str, Any]) -> Dict[str, Any]:
        required = ["agent_id", "allowed_action", "repo", "expires_at", "policy_version", "signature"]
        if any(key not in token for key in required):
            return {"ok": False, "reason": "invalid_token_schema"}
        if token["allowed_action"] != intent.get("action"):
            return {"ok": False, "reason": "action_not_allowed_by_token"}
        if token["repo"] != self.client.repo:
            return {"ok": False, "reason": "repo_mismatch"}
        if datetime.fromisoformat(token["expires_at"]) < datetime.now(timezone.utc):
            return {"ok": False, "reason": "token_expired"}

        unsigned = {k: token[k] for k in required if k != "signature"}
        expected = self._sign_payload(unsigned)
        if not hmac.compare_digest(expected, token["signature"]):
            return {"ok": False, "reason": "invalid_signature"}
        return {"ok": True}

    def _sign_payload(self, payload: Dict[str, Any]) -> str:
        serialized = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
        return hmac.new(self.signing_key.encode("utf-8"), serialized, hashlib.sha256).hexdigest()
