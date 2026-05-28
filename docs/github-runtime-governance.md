# GitHub Runtime Governance (MVP)

AgentGuard는 GitHub API 실행 직전의 런타임 경로를 가로채고(policy-bound interception), 정책 평가 결과에 따라 실행 토큰을 발급/차단합니다.

## Runtime Interception MVP 목적

- AI Agent의 GitHub 액션이 **직접 GitHub API를 호출하지 못하도록** 강제합니다.
- 모든 실행 요청은 `GitHubRuntimeExecutor`를 통과하며, 정책/토큰 검증이 통과될 때만 실행됩니다.
- mock/sandbox 환경에서 허용/차단/승인 대기 시나리오를 반복 검증해 실행 경로 강제성을 입증합니다.

## Runtime Path

AI Agent → GitHub Adapter → AgentGuard Interception → Policy Evaluation → Conditional Execution Token → GitHub API Executor

## 구성 요소

- `agentguard/integrations/github/client.py`
  - GitHub REST 래퍼 (`create_branch`, `create_pull_request`, `update_workflow_file`)
  - `GITHUB_TOKEN`, `GITHUB_REPO` 사용
  - `sandbox/mock` 저장소명 강제
- `agentguard/integrations/github/policies.py`
  - 정책 결정: `ALLOW`, `REVIEW_REQUIRED`, `DENY`
- `agentguard/integrations/github/executor.py`
  - 정책 통과 전 GitHub API 호출 금지
  - 실행 토큰(만료/서명/행위 바인딩) 검증 후에만 실행
- `examples/github_runtime_agent.py`
  - 시나리오: `create_branch`, `create_pr`, `workflow_modification`, `secret_access_attempt`
  - 출력: scenario, intent, policy decision, matched policy, token 발급/검증, API 호출 여부, 최종 결과, audit 이벤트

## 지원 시나리오 및 예상 결과

1. `secret_access_attempt`
   - 정책: `DENY`
   - 토큰: 미발급
   - GitHub API: 호출 안 함
   - 최종: `BLOCKED BEFORE EXECUTION`

2. `workflow_modification`
   - 정책: `REVIEW_REQUIRED` (또는 정책 변경 시 `DENY`)
   - 토큰: 미발급
   - GitHub API: 호출 안 함
   - 최종: `BLOCKED BEFORE EXECUTION` 또는 `HUMAN REVIEW REQUIRED`

3. `create_branch`
   - 정책: `ALLOW`
   - 토큰: 발급 후 검증
   - GitHub API: sandbox repo에서만 호출
   - 최종: `EXECUTED IN SANDBOX` 또는 `SAFE MOCK EXECUTED`

4. `create_pr`
   - 정책: `ALLOW`
   - 토큰: 발급 후 검증
   - GitHub API: sandbox repo에서만 호출
   - 최종: `EXECUTED IN SANDBOX` 또는 `SAFE MOCK EXECUTED`

## 테스트 명령어

```bash
PYTHONPATH=. python examples/github_runtime_agent.py --scenario secret_access_attempt
PYTHONPATH=. python examples/github_runtime_agent.py --scenario workflow_modification
PYTHONPATH=. python examples/github_runtime_agent.py --scenario create_branch
PYTHONPATH=. python examples/github_runtime_agent.py --scenario create_pr
pytest -q tests/test_github_runtime_integration.py
```

## 보안 원칙

- AI Agent는 영구 권한을 가지지 않음
- 실행 시점에만 조건부 토큰 발급
- `modify_workflow`, `export_secrets`, `secret_access_attempt` 등은 기본적으로 실행 전 차단
- 파괴적/운영 영향 GitHub 액션은 MVP 범위에서 구현하지 않음
- `GITHUB_REPO`는 sandbox/test/demo/lab 패턴만 허용하고, production repo로 보이면 즉시 차단

## GitHub API 호출 금지 액션

- `delete_repo`
- `export_secrets`
- `secret_access_attempt`
- `disable_branch_protection`
- `modify_workflow` (기본값: 리뷰 필요)
- `force_push`
- `production_file_modify`

## Execution Token 기반 실행 흐름

1. 정책 결정이 `ALLOW`인지 확인
2. 실행 토큰 발급 (action/repo/expiry/policy_version/signature 바인딩)
3. 토큰 검증 (action/repo/expiry/signature)
4. 검증 통과 시에만 GitHub executor 실행
5. 실패 시 GitHub API 호출 없이 차단하고 audit에 기록
