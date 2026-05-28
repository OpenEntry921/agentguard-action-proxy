import argparse
import base64
import json

from agentguard.integrations.github.client import GitHubClient
from agentguard.integrations.github.executor import GitHubRuntimeExecutor


SCENARIOS = {
    "create_branch": {
        "action": "create_branch",
        "params": {"branch_name": "agentguard-sandbox-branch", "from_sha": "REPLACE_WITH_BASE_SHA"},
    },
    "create_pr": {
        "action": "create_pr",
        "params": {"title": "AgentGuard Sandbox PR", "head": "agentguard-sandbox-branch", "base": "main", "body": "runtime governance demo"},
    },
    "workflow_modification": {
        "action": "modify_workflow",
        "params": {
            "path": ".github/workflows/demo.yml",
            "message": "[safe-mode] runtime governance simulation",
            "content_b64": base64.b64encode(b"name: demo\non: workflow_dispatch\n").decode("utf-8"),
            "sha": "REPLACE_WITH_FILE_SHA",
            "branch": "agentguard-sandbox-branch",
        },
    },
    "secret_access_attempt": {"action": "secret_access_attempt", "params": {"target": "env"}},
}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scenario", required=True, choices=SCENARIOS.keys())
    parser.add_argument("--agent-id", default="github-agent-01")
    args = parser.parse_args()

    client = GitHubClient.from_env()
    executor = GitHubRuntimeExecutor(client)
    intent = SCENARIOS[args.scenario]

    print(f"[Scenario] {args.scenario}")
    print(f"[Intent] AI Agent requests GitHub action: {intent['action']}")

    evaluation = executor.evaluate_and_mint_token(args.agent_id, intent["action"])
    policy = evaluation["policy"]
    decision = policy["decision"]
    if isinstance(decision, str) and "." in decision:
        decision = decision.split(".")[-1]
    print(f"[Policy] {decision}")
    print(f"[Matched Policy] {policy['reason']} ({policy['policy_version']})")

    if not evaluation.get("allowed"):
        print("[Token] not issued")
        print("[Token Validation] not_run")
        print("[GitHub API] called: no")
        print("[Final Result] BLOCKED BEFORE EXECUTION")
        print("\n[Audit]")
        print(json.dumps(executor.audit_log[-1], indent=2))
        return

    print("[Token] issued")
    result = executor.execute(intent, evaluation["execution_token"])
    token_validation = result.get("token_validation", {"ok": False})
    print(f"[Token Validation] {'passed' if token_validation.get('ok') else 'failed'}")
    print(f"[GitHub API] called: {'yes' if result.get('github_api_called') else 'no'}")
    final_result = "EXECUTED IN SANDBOX" if result.get("executed") else "SAFE MOCK EXECUTED"
    if result.get("blocked_before_execution"):
        final_result = "HUMAN REVIEW REQUIRED" if result.get("reason") == "review_required_blocked" else "BLOCKED BEFORE EXECUTION"
    print(f"[Final Result] {final_result}")
    print("\n[Execution Result]")
    print(json.dumps(result, indent=2))
    print("\n[Audit]")
    print(json.dumps(executor.audit_log[-1], indent=2))


if __name__ == "__main__":
    main()
