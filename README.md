# AgentGuard Action Proxy

**AgentGuard Action Proxy는 AI Agent가 외부 시스템에 액션을 실행하기 전에 정책, 위험도, 승인 조건, 감사 요구사항을 강제하는 AI Runtime Execution Governance 계층이다.**

이 프로젝트의 중심은 XRPL 또는 DID 자체가 아니라, **AI runtime에서 생성된 실행 요청을 안전하게 중개하는 Action Proxy**다. XRPL 결제/조회, DID 신원 기준, 감사 앵커링은 실행 대상 또는 신뢰 보강 수단으로 사용할 수 있지만, AgentGuard의 핵심 가치는 “AI가 무엇을 실행할 수 있는지”를 런타임에서 결정하고 통제하는 것이다.

## 한 줄 소개

AgentGuard Action Proxy는 **AI Agent의 실행 요청을 정책 기반으로 사전 평가하고, 조건부 승인과 감사 가능한 실행 결과를 제공하는 Runtime Governance System**이다.

## 핵심 포지셔닝

- **AI Runtime Execution Governance**: AI Agent가 만든 액션 요청을 실행 전에 평가한다.
- **Action Proxy**: Agent가 직접 외부 시스템을 호출하지 않고, AgentGuard가 통제된 실행 경로를 제공한다.
- **Pre-execution Control**: 사후 탐지보다 실행 전 허용/조건부 승인/차단 결정을 우선한다.
- **Policy + Risk + Approval + Audit**: 정책, 위험 점수, 사람 승인, 감사 기록을 하나의 실행 경로로 묶는다.
- **Pluggable execution targets**: XRPL은 현재 데모와 통합 대상 중 하나이며, AgentGuard는 특정 ledger에 종속된 제품이 아니다.

## AgentGuard가 해결하는 문제

AI Agent는 자동화 속도를 높이지만, 실행 권한이 직접 주어지면 다음 문제가 발생한다.

- 정책 밖 송금, API 호출, 운영 액션을 즉시 실행할 수 있다.
- 승인 경계가 불명확하면 “자동화”와 “무단 실행”을 구분하기 어렵다.
- 실행 전 판단 근거와 실행 후 감사 근거가 분리되어 책임 추적이 어려워진다.
- 사람 승인, 위험 점수, 차단 조건이 일관된 runtime flow로 연결되지 않는다.

AgentGuard는 이 문제를 **Action Proxy를 통한 실행 전 거버넌스**로 해결한다.

## 실행 흐름

```text
AI Agent Request
→ Policy Evaluation
→ Risk Evaluation
→ Decision
→ Conditional Approval (if needed)
→ Transient Execution Token
→ Controlled Execution
→ Audit Receipt
```

설명:

- AI Agent는 실행 의도를 요청으로 제출한다.
- AgentGuard는 정책, 위험 점수, 차단 조건을 평가한다.
- 안전한 요청은 승인되고, 경계 구간은 사람 확인을 요구하며, 위험하거나 정책 위반인 요청은 차단된다.
- 승인된 요청만 일회성 실행 권한을 통해 외부 시스템으로 전달된다.
- 실행 결과는 감사 가능한 레코드로 남는다.

## Decision Model

- **0~30: APPROVED**
  - 안전 구간
  - 정책과 위험 기준을 통과한 요청
  - 통제된 실행 경로로 진행 가능
- **31~69: CONDITIONAL_APPROVAL**
  - 조건부 승인 구간
  - 웹에서 Confirm Execution 필요
  - Confirm 이후에만 실행 가능
- **70~100: BLOCKED**
  - 실행 차단
  - transient token 발급 금지
  - 외부 시스템 submit/call 금지

추가 원칙:

- `blocked_conditions`는 risk score보다 우선한다.
- 예: `invalid_destination`, `account_not_found`, `blacklisted_wallet`, `trustline_missing`, `issuer_not_allowed`, `currency_not_allowed`, `unknown_agent`

## Runtime Modes

- **LIVE**: 실제 외부 시스템 조회/제출이 가능한 운영형 모드
- **MOCK**: 실제 제출 없이 시뮬레이션하는 데모/개발 모드
- **TEST**: 테스트용 모드, 외부 네트워크 호출 금지

테스트 원칙:

- `pytest` 실행 시 TEST mode가 강제되어야 한다.

## 정책 파일 위치 (Canonical)

- Canonical policy file: `configs/policy.yaml`
- 루트 `policy.yaml`은 더 이상 사용하지 않는다.
- 정책 파일은 `configs/` 아래에서 관리한다.

## 실행 방법

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 -m pytest -q
python3 -m uvicorn agentguard.api:app --reload
```

## 데모 시나리오

- 브라우저에서 요청 Preview 확인
- Execute 요청
- 조건부 승인인 경우 Confirm Execution 수행
- 승인된 요청의 controlled execution 결과 확인
- BLOCKED 시나리오에서 실행 차단 확인
- 감사 레코드와 request/decision/result 식별자 확인

### Gold Trading Governance Demo (`ts-agentguard`)

TypeScript Fastify 구현체는 AI Agent의 금 매수 요청을 `BUY_GOLD` action으로 받아 Settlement Orchestrator 실행 경로를 거버넌스한다. 현재 데모는 실제 Settlement Orchestrator HTTP 호출, XRPL 직접 호출, seed/private key 저장을 하지 않으며 mock 실행 결과만 반환한다.

Gold 정책:

- 허용 통화: `XRP`
- 허용 대상: `gold:vault_*`
- `<=100g`: `ALLOW`, `LOW`
- `101~1000g`: `REVIEW_REQUIRED`
- `>1000g`: `DENY`

예시 Preview 요청:

```bash
cd ts-agentguard
npm run build
node dist/server.js
curl -s http://localhost:8000/actions/preview \
  -H 'Content-Type: application/json' \
  -d '{
    "action_id": "gold-demo-001",
    "actor_type": "ai_agent",
    "actor_id": "agent-gold-trader",
    "action_type": "BUY_GOLD",
    "target_system": "settlement_orchestrator",
    "target_resource": "gold:vault_alpha",
    "parameters": {
      "goldAmountGrams": 50,
      "vaultId": "vault_alpha",
      "currency": "XRP"
    },
    "context": {},
    "requested_at": "2026-06-14T00:00:00.000Z"
  }'
```

허용된 `BUY_GOLD` 요청은 `/actions/{actionId}/token`에서 transient token을 발급받은 뒤 `/actions/execute`로 mock settlement executor를 실행할 수 있다. 실행 결과는 다음 형태를 포함한다.

```json
{
  "executed": true,
  "settlementId": "mock-settlement-...",
  "network": "xrpl-testnet"
}
```

Audit event에는 gold demo 추적을 위해 `goldAmountGrams`, `vaultId`가 함께 기록된다.

## 보안 원칙

- 사전 정책 통제(Pre-execution control)
- 1회성 Transient Token 기반 실행 권한
- Replay Protection(만료/nonce/재사용 차단)
- 감사 레코드(request_hash, policy_hash, decision_id, execution result)
- Seed/private key/API secret은 저장하지 않음

## 현재 구현 상태와 향후 계획

### 현재 구현 상태

- 정책 평가 기반 실행 통제 흐름
- Risk score + blocked conditions 조합 의사결정
- 조건부 승인(Confirm Execution) 경로
- XRPL을 실행 대상 예시로 포함한 controlled execution 경로
- 감사 필드 중심의 실행 결과 기록

### 향후 계획

- 정책 스키마/버전 관리 고도화
- 운영 환경용 감사 저장소 확장(append-only 강화)
- 대시보드 기반 정책/승인 운영 개선
- 실행 대상별 policy template 확장
- ledger/DID 기반 신뢰 앵커 옵션 고도화

## 문서 맵

### Architecture

- [Runtime Governance](docs/architecture/runtime-governance.md)
- [Policy Engine](docs/architecture/policy-engine.md)
- [Execution Flow](docs/architecture/execution-flow.md)
- [XRPL Integration](docs/architecture/xrpl-integration.md)

### Policies

- [Decision Model](docs/policies/decision-model.md)
- [Risk Scoring](docs/policies/risk-scoring.md)
- [Blocked Conditions](docs/policies/blocked-conditions.md)
- [Conditional Approval](docs/policies/conditional-approval.md)

### Security

- [Transient Token](docs/security/transient-token.md)
- [Replay Protection](docs/security/replay-protection.md)
- [Audit Model](docs/security/audit-model.md)
- [Threat Model](docs/security/threat-model.md)

### Demo / Config

- [Demo Flow](docs/demo/demo-flow.md)
- [Policy Structure](docs/configs/policy-structure.md)
- [Runtime Modes](docs/configs/runtime-modes.md)

## XRPL 실행 대상 환경변수

XRPL은 AgentGuard의 핵심 정체성이 아니라, 현재 데모에서 사용하는 실행 대상 중 하나다. XRPL 서명/제출은 브라우저 입력이 아니라 서버 환경변수 기반 signer로 동작한다.

```bash
XRPL_TESTNET_SEED=
XRPL_TESTNET_URL=
USE_XRPL_SUBMIT=true
USE_XRPL_LIVE_LOOKUP=true
```

- `XRPL_TESTNET_SEED`로 signer wallet을 derive하여 `Account`/signing에 사용한다.
- destination은 수취 주소이며 signer account와 분리된 개념이다.
- seed/private key는 response/json/log/audit에 저장하지 않는다.
