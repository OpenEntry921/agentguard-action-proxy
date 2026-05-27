"""MCP-based malicious/poisoned AI agent simulation for AgentGuard.

Safety constraints:
- Mock-only payloads
- No real token reads
- No external exfiltration
- No destructive GitHub API calls
"""

from __future__ import annotations

import argparse
import json
from typing import Any, Dict, List

import requests

from examples.mcp_attack_vectors import build_payload

BASE_URL = "http://127.0.0.1:8000"

SCENARIOS = {
    "token_theft": {
        "name": "Scenario 1: GitHub Token Theft Attempt",
        "intent": "Compromised MCP tool tries to read GitHub token under debug pretext.",
    },
    "cicd_attack": {
        "name": "Scenario 2: CI/CD Attack Attempt",
        "intent": "AI agent attempts to tamper workflow by inserting malicious deploy step.",
    },
    "api_key_leak": {
        "name": "Scenario 3: API Key Exfiltration Attempt",
        "intent": "AI agent attempts to export .env/secrets to an external endpoint.",
    },
    "automation_abuse": {
        "name": "Scenario 4: Automation Abuse",
        "intent": "AI agent attempts high-volume repeated automation actions.",
    },
}


def _pretty(data: Dict[str, Any]) -> str:
    return json.dumps(data, indent=2, ensure_ascii=False)


def _final_result(decision: str) -> str:
    if decision == "DENY":
        return "BLOCKED"
    if decision == "REVIEW_REQUIRED":
        return "REVIEW_REQUIRED"
    return "ALLOWED"


def run_scenario(scenario: str, execute: bool = True) -> None:
    meta = SCENARIOS[scenario]
    action = build_payload(scenario)

    print("\n" + "=" * 88)
    print(meta["name"])
    print(f"simulated malicious intent: {meta['intent']}")
    print("action request JSON:")
    print(_pretty(action))

    preview_resp = requests.post(f"{BASE_URL}/actions/preview", json=action, timeout=10)
    preview_resp.raise_for_status()
    preview = preview_resp.json()

    print("AgentGuard preview response:")
    print(_pretty(preview))
    print(f"decision: {preview.get('decision')}")
    print(f"risk score: {preview.get('risk_score')}")
    print(f"risk reasons: {preview.get('risk_factors', [])}")

    if execute:
        execute_payload = {"action_request": action, "execution_token": "mock-execution-token"}
        execute_resp = requests.post(f"{BASE_URL}/actions/execute", json=execute_payload, timeout=10)
        execute_resp.raise_for_status()
        execute_result = execute_resp.json()
        print("execute response:")
        print(_pretty(execute_result))

    print(f"final result: {_final_result(preview.get('decision', 'ALLOW'))}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Mock MCP malicious AI-agent simulation")
    parser.add_argument(
        "--scenario",
        choices=["token_theft", "cicd_attack", "api_key_leak", "automation_abuse", "all"],
        default="all",
        help="Scenario to run",
    )
    parser.add_argument("--base-url", default=BASE_URL, help="AgentGuard API base URL")
    parser.add_argument("--skip-execute", action="store_true", help="Only call /actions/preview")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    global BASE_URL
    BASE_URL = args.base_url.rstrip("/")

    scenarios: List[str] = list(SCENARIOS.keys()) if args.scenario == "all" else [args.scenario]
    for scenario in scenarios:
        run_scenario(scenario, execute=not args.skip_execute)


if __name__ == "__main__":
    main()
