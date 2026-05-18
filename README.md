# AgentGuard

**AgentGuard는 AI Agent 및 Autonomous Finance Runtime을 위한 정책 기반 실행 거버넌스 시스템이다.**

AgentGuard는 XRPL의 Payment, Trustline, Memo, Account Verification 기능을 대체하지 않는다. 대신 AI Agent가 이 기능들을 언제, 누구에게, 어떤 조건에서 실행할 수 있는지를 정책적으로 통제하는 Runtime Governance Layer다.

## 한 줄 소개

AgentGuard는 **"AI Agent의 금융 실행을 사전 정책으로 통제하는 Runtime Governance Layer"** 이다.
또한 AgentGuard는 단순 wallet firewall이 아니라, DID와 XRPL signer account를 연결해 실행 권한을 정책적으로 통제하는 Runtime Governance System이다.

## 핵심 개념

- AgentGuard는 탐지 중심 도구가 아니라 실행 전 통제 계층이다.
- AI Agent는 직접 자산을 실행하지 않고, AgentGuard 판단을 통과한 요청만 실행된다.
- 정책(Policy), 위험평가(Risk), 승인흐름(Decision), 감사(Audit)를 하나의 실행 경로로 묶는다.
- XRP와 issued token(예: RLUSD)을 같은 방식으로 다루지 않고, 자산 특성(XRP native vs Trustline 필요)을 구분한다.

## 실행 흐름

Policy
→ Risk Evaluation
→ Conditional Approval
→ Human Confirmation
→ XRPL Execution
→ Audit & Memo Anchoring

설명:
- AI Agent가 직접 자산을 실행하는 구조가 아니라, AgentGuard가 정책 판단 후 실행 가능 여부를 결정한다.
- 조건부 승인 구간에서는 사람 Confirm 이후에만 XRPL submit이 가능하다.

## Decision Model

- **0~30: APPROVED**
  - 안전 구간
  - 즉시 실행 가능
- **31~69: CONDITIONAL_APPROVAL**
  - 조건부 승인 구간
  - 웹에서 Confirm Execution 필요
  - Confirm 후 XRPL submit
  - TX Hash 생성
- **70~100: BLOCKED**
  - 실행 차단
  - token 발급 금지
  - XRPL submit 금지

추가 원칙:
- `blocked_conditions`는 risk score보다 우선한다.
- 예: `invalid_destination`, `account_not_found`, `blacklisted_wallet`, `trustline_missing`, `issuer_not_allowed`, `currency_not_allowed`

## Runtime Modes

- **LIVE**: 실제 XRPL account lookup 수행, 실제 XRPL submit 가능
- **MOCK**: 실제 submit 없이 시뮬레이션(데모/개발용)
- **TEST**: pytest용, 외부 XRPL 네트워크 호출 금지

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
- XRPL Submit 후 TX Hash 확인
- BLOCKED 시나리오에서 실행 차단 확인

## 보안 원칙

- 사전 정책 통제(Pre-execution control)
- 1회성 Transient Token 기반 실행 권한
- Replay Protection(만료/nonce/재사용 차단)
- 감사 레코드(request_hash, policy_hash, decision_id, tx_hash)
- Seed/private key는 저장하지 않음

## 현재 구현 상태와 향후 계획

### 현재 구현 상태

- 정책 평가 기반 실행 통제 흐름
- Risk score + blocked conditions 조합 의사결정
- 조건부 승인(Confirm Execution) 경로
- XRPL 연동(조회/제출 경로 포함)
- 감사 필드 중심의 실행 결과 기록

### 향후 계획

- 정책 스키마/버전 관리 고도화
- 운영 환경용 감사 저장소 확장(append-only 강화)
- 대시보드 기반 정책/승인 운영 개선
- 토큰/자산 정책 템플릿 확장

## 문서 맵

### Architecture
- [Runtime Governance](docs/architecture/runtime-governance.md)
- [Policy Engine](docs/architecture/policy-engine.md)
- [XRPL Integration](docs/architecture/xrpl-integration.md)
- [Execution Flow](docs/architecture/execution-flow.md)

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


## XRPL 서버 Signer 환경변수

XRPL 서명/제출은 브라우저 입력이 아니라 서버 환경변수 기반 단일 signer로 동작합니다.

```bash
XRPL_TESTNET_SEED=
XRPL_TESTNET_URL=
USE_XRPL_SUBMIT=true
USE_XRPL_LIVE_LOOKUP=true
```

- `XRPL_TESTNET_SEED`로 signer wallet을 derive하여 `Account`/signing에 사용합니다.
- destination은 수취 주소이며 signer account와 분리된 개념입니다.
- seed/private key는 response/json/log/audit에 저장하지 않습니다.
