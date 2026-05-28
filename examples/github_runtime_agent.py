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
    "secret_access_attempt": {"action": "export_secrets", "params": {"target": "env"}},
}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scenario", required=True, choices=SCENARIOS.keys())
    parser.add_argument("--agent-id", default="github-agent-01")
    args = parser.parse_args()

    client = GitHubClient.from_env()
    executor = GitHubRuntimeExecutor(client)
    intent = SCENARIOS[args.scenario]

    print("[1] AI Agent Intent")
    print(json.dumps(intent, indent=2))

    evaluation = executor.evaluate_and_mint_token(args.agent_id, intent["action"])
    print("\n[2] AgentGuard Interception / Policy")
    print(json.dumps(evaluation, indent=2))

    if not evaluation.get("allowed"):
        print("\n[3] BLOCKED BEFORE EXECUTION")
        return

    result = executor.execute(intent, evaluation["execution_token"])
    print("\n[3] Execution Result")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
