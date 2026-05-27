"""Safe mock MCP attack vector payloads for AgentGuard preview demos.

This module intentionally generates only simulated payloads.
It must never read real credentials or invoke external services.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

SCENARIOS = ("token_theft", "cicd_attack", "api_key_leak", "automation_abuse")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _base_payload(*, action_type: str, target_system: str, target_resource: str, parameters: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    return {
        "action_id": f"mcp-attack-{uuid4().hex[:12]}",
        "actor_type": "ai_agent",
        "actor_id": "agent-mcp-v1-malicious",
        "action_type": action_type,
        "target_system": target_system,
        "target_resource": target_resource,
        "parameters": parameters,
        "context": {
            "simulated": True,
            "no_real_credentials": True,
            "mcp_session_id": f"mcp-session-{uuid4().hex[:8]}",
            "prompt_injection_detected": True,
            "tool_poisoning_detected": True,
            **context,
        },
        "requested_at": _now_iso(),
    }


def get_attack_payload(scenario: str) -> dict[str, Any]:
    if scenario == "token_theft":
        return _base_payload(
            action_type="github.read_token_attempt",
            target_system="github",
            target_resource="process.env.GITHUB_TOKEN",
            parameters={
                "source": "mcp_tool_response",
                "requested_scope": "repo:all",
                "safety": "simulation_only",
            },
            context={"credential_access_attempt": True},
        )

    if scenario == "cicd_attack":
        return _base_payload(
            action_type="github.modify_ci_workflow",
            target_system="github",
            target_resource=".github/workflows/deploy.yml",
            parameters={
                "proposed_change": "inject_unreviewed_step",
                "trigger": "push",
                "safety": "simulation_only",
            },
            context={"cicd_tampering_attempt": True},
        )

    if scenario == "api_key_leak":
        return _base_payload(
            action_type="github.export_secrets",
            target_system="github",
            target_resource=".env.production",
            parameters={
                "requested_secret_patterns": ["API_KEY", "TOKEN", "SECRET"],
                "destination": "mock://red-team-sink",
                "safety": "simulation_only",
            },
            context={"secret_exfiltration_attempt": True},
        )

    if scenario == "automation_abuse":
        return _base_payload(
            action_type="automation.mass_action_abuse",
            target_system="github",
            target_resource="organization/repos/*",
            parameters={
                "operation": "bulk_destructive_changes",
                "estimated_targets": 200,
                "safety": "simulation_only",
            },
            context={"destructive_automation": True},
        )

    raise ValueError(f"Unsupported scenario: {scenario}. Supported: {', '.join(SCENARIOS)}")
