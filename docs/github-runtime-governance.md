# GitHub Runtime Governance (MVP)

AgentGuard는 GitHub API 실행 직전의 런타임 경로를 가로채고(policy-bound interception), 정책 평가 결과에 따라 실행 토큰을 발급/차단합니다.

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

## 보안 원칙

- AI Agent는 영구 권한을 가지지 않음
- 실행 시점에만 조건부 토큰 발급
- `modify_workflow`, `export_secrets` 등은 기본적으로 실행 전 차단
- 파괴적/운영 영향 GitHub 액션은 MVP 범위에서 구현하지 않음
