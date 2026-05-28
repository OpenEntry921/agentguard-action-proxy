import os
from dataclasses import dataclass
from typing import Any, Dict, Optional

import json
from urllib import request
from urllib.error import HTTPError, URLError


@dataclass
class GitHubClient:
    token: str
    repo: str
    api_base: str = "https://api.github.com"

    @classmethod
    def from_env(cls) -> "GitHubClient":
        token = os.getenv("GITHUB_TOKEN", "")
        repo = os.getenv("GITHUB_REPO", "")
        return cls(token=token, repo=repo)

    def _enforce_sandbox_repo(self) -> None:
        if "sandbox" not in self.repo.lower() and "mock" not in self.repo.lower():
            raise ValueError("GITHUB_REPO must be a sandbox/mock repository")

    def _headers(self) -> Dict[str, str]:
        if not self.token:
            raise ValueError("GITHUB_TOKEN is required")
        return {
            "Authorization": f"Bearer {self.token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }

    def _request(self, method: str, path: str, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        self._enforce_sandbox_repo()
        url = f"{self.api_base}{path}"
        data = json.dumps(payload).encode("utf-8") if payload is not None else None
        req = request.Request(url, data=data, method=method, headers={**self._headers(), "Content-Type": "application/json"})
        try:
            with request.urlopen(req, timeout=15) as response:
                raw = response.read().decode("utf-8")
                parsed = json.loads(raw) if raw else {}
                return {"ok": True, "status_code": response.status, "data": parsed}
        except HTTPError as err:
            return {"ok": False, "status_code": err.code, "error": err.read().decode("utf-8")}
        except URLError as err:
            return {"ok": False, "status_code": 0, "error": str(err)}

    def create_branch(self, branch_name: str, from_sha: str) -> Dict[str, Any]:
        return self._request("POST", f"/repos/{self.repo}/git/refs", {"ref": f"refs/heads/{branch_name}", "sha": from_sha})

    def create_pull_request(self, title: str, head: str, base: str, body: str) -> Dict[str, Any]:
        return self._request("POST", f"/repos/{self.repo}/pulls", {"title": title, "head": head, "base": base, "body": body})

    def update_workflow_file(self, path: str, message: str, content_b64: str, sha: str, branch: str) -> Dict[str, Any]:
        if not path.startswith(".github/workflows/"):
            return {"ok": False, "error": "safe_mode_only_workflow_path_allowed"}
        return self._request(
            "PUT",
            f"/repos/{self.repo}/contents/{path}",
            {"message": message, "content": content_b64, "sha": sha, "branch": branch},
        )
