from agentguard.executors.base import Executor
from agentguard.models import ActionRequest


class MockGitHubExecutor(Executor):
    def preview(self, action_request: ActionRequest) -> dict:
        return {"executor": "mock_github", "summary": f"Would run {action_request.action_type} on {action_request.target_resource}"}

    def execute(self, action_request: ActionRequest, execution_token: str) -> dict:
        return {
            "executor": "mock_github",
            "executed": True,
            "message": f"Mock executed {action_request.action_type} on {action_request.target_resource}",
        }
