from datetime import datetime, timedelta, timezone

from agentguard.integrations.github.client import GitHubClient
from agentguard.integrations.github.executor import GitHubRuntimeExecutor
from agentguard.integrations.github.policies import PolicyDecision


class FakeGitHubClient(GitHubClient):
    def __init__(self, repo: str = "acme/agentguard-runtime-lab"):
        super().__init__(token="fake-token", repo=repo, api_base="https://example.invalid")
        self.called = []

    def create_branch(self, branch_name: str, from_sha: str):
        self.called.append(("create_branch", branch_name, from_sha))
        return {"ok": True, "mock": True}

    def create_pull_request(self, title: str, head: str, base: str, body: str):
        self.called.append(("create_pr", title, head, base, body))
        return {"ok": True, "mock": True}


def test_secret_access_attempt_denied_and_no_api_call():
    client = FakeGitHubClient()
    executor = GitHubRuntimeExecutor(client)

    evaluation = executor.evaluate_and_mint_token("agent-1", "secret_access_attempt")

    assert evaluation["allowed"] is False
    assert evaluation["policy"]["decision"] == PolicyDecision.DENY.value
    assert evaluation["github_api_called"] is False
    assert client.called == []


def test_workflow_modification_review_required_and_no_api_call():
    client = FakeGitHubClient()
    executor = GitHubRuntimeExecutor(client)

    evaluation = executor.evaluate_and_mint_token("agent-1", "modify_workflow")

    assert evaluation["allowed"] is False
    assert evaluation["policy"]["decision"] in {PolicyDecision.REVIEW_REQUIRED.value, PolicyDecision.DENY.value}
    assert evaluation["github_api_called"] is False
    assert client.called == []


def test_create_branch_allow_token_then_executor_called():
    client = FakeGitHubClient()
    executor = GitHubRuntimeExecutor(client)

    evaluation = executor.evaluate_and_mint_token("agent-1", "create_branch")
    assert evaluation["allowed"] is True
    assert evaluation["execution_token_issued"] is True

    result = executor.execute(
        {"action": "create_branch", "params": {"branch_name": "feature/test", "from_sha": "abc123"}},
        evaluation["execution_token"],
    )

    assert result["executed"] is True
    assert result["token_validation"]["ok"] is True
    assert result["github_api_called"] is True
    assert client.called and client.called[0][0] == "create_branch"


def test_token_mismatch_or_expired_blocks_execution():
    client = FakeGitHubClient()
    executor = GitHubRuntimeExecutor(client)

    evaluation = executor.evaluate_and_mint_token("agent-1", "create_branch")
    token = dict(evaluation["execution_token"])
    token["allowed_action"] = "create_pr"
    mismatch = executor.execute({"action": "create_branch", "params": {"branch_name": "a", "from_sha": "b"}}, token)
    assert mismatch["executed"] is False
    assert mismatch["github_api_called"] is False

    expired = dict(evaluation["execution_token"])
    expired["expires_at"] = (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat()
    expired_result = executor.execute({"action": "create_branch", "params": {"branch_name": "a", "from_sha": "b"}}, expired)
    assert expired_result["executed"] is False
    assert expired_result["reason"] == "token_expired"
    assert expired_result["github_api_called"] is False


def test_non_sandbox_repo_blocked():
    client = GitHubClient(token="fake-token", repo="acme/production-core")

    try:
        client.create_branch("feature/test", "abc123")
        assert False, "Expected ValueError for non-sandbox repo"
    except ValueError as exc:
        assert "sandbox/test/demo" in str(exc)
