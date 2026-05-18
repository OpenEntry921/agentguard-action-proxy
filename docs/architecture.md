# 아키텍처 (Architecture)

## 포지셔닝

AgentGuard Action Proxy는 AI Agent가 생성한 실행 요청을 외부 시스템에 전달하기 전에 정책적으로 평가하는 **AI Runtime Execution Governance** 계층이다. 이 아키텍처의 중심은 ledger, DID, wallet이 아니라 runtime decision path다.

XRPL, DID, 감사 앵커는 신뢰와 추적성을 강화하는 선택적 구성요소다. AgentGuard는 특정 체인이나 DID method에 종속되지 않고, “AI가 실행하려는 액션을 누가 어떤 조건에서 허용할 것인가”를 다룬다.

## 시스템 구조 (System Structure)

```text
AI Agent
   ↓
Action Request
   ↓
AgentGuard API / Gateway
   ↓
Policy Engine
   ↓
Risk Evaluation
   ↓
Decision Model
   ↓
Conditional Approval (optional)
   ↓
Transient Execution Token
   ↓
Execution Proxy
   ↓
External Execution Target
   ↓
Audit Receipt / Action Log
   ↓
Optional Ledger or DID Anchor
```

## 역할 분리 (Role Separation)

### AI Agent

AI Agent는 실행 의도와 필요한 payload를 생성한다. 하지만 Agent는 직접 자산, API, 운영 시스템에 대한 최종 실행 권한을 갖지 않는다.

### AgentGuard Runtime

AgentGuard Runtime은 실행 전 판단을 담당한다.

- 요청 payload 정규화
- 정책 파일 기반 허용/차단 판단
- 위험 점수 계산
- 조건부 승인 필요 여부 결정
- transient execution token 발급
- 감사 레코드 생성

### Execution Proxy

Execution Proxy는 승인된 요청만 외부 시스템으로 전달한다. 외부 시스템은 XRPL, 결제 API, SaaS API, 내부 운영 API 등으로 확장될 수 있다.

### XRPL / DID / Ledger Anchor

XRPL과 DID는 core runtime governance의 전제 조건이 아니라 선택적 신뢰 계층이다.

- XRPL은 데모 실행 대상 또는 감사 앵커 대상이 될 수 있다.
- DID는 agent identity나 issuer trust를 표현하는 옵션으로 사용할 수 있다.
- 어떤 경우에도 XRPL이나 DID가 policy engine 자체를 대체하지 않는다.

## End-to-End Flow

```text
1. AI Agent submits an action request
2. AgentGuard evaluates policy and risk
3. Decision is produced: APPROVED / CONDITIONAL_APPROVAL / BLOCKED
4. Conditional requests wait for human confirmation
5. Approved requests receive a one-time execution token
6. Execution Proxy performs the controlled action
7. Runtime records request, decision, and result evidence
8. Optional anchoring can summarize audit evidence externally
```

## 설계 원칙

- **Pre-execution over post-detection**: 실행 후 탐지보다 실행 전 통제를 우선한다.
- **Policy as runtime boundary**: 정책은 문서가 아니라 runtime decision input이다.
- **Agent does not hold final authority**: Agent는 의도를 만들고, Runtime이 실행 권한을 판단한다.
- **Composable trust**: DID, ledger, signer, audit anchor는 필요에 따라 붙일 수 있는 trust adapter다.
- **Auditable decisions**: 실행 여부뿐 아니라 판단 근거를 함께 기록한다.

## AgentGuard가 XRPL/DID 프로젝트가 아닌 이유

기존 설명은 XRPL DID와 VC/VP 흐름을 중심으로 시스템을 설명했다. 현재 포지셔닝에서는 XRPL/DID를 다음처럼 재정의한다.

| 과거 중심 표현 | 현재 포지셔닝 |
|---|---|
| XRPL DID Ledger | Optional trust/anchor layer |
| DID Resolver | Optional identity adapter |
| Policy Credential / VC | Optional policy evidence format |
| XRPL Payment | One possible execution target |
| Merkle Root XRPL Anchor | Optional audit integrity anchor |
| AgentGuard Gateway | Core runtime governance boundary |

핵심은 AgentGuard가 “ledger 위의 DID 앱”이 아니라 **AI action execution을 통제하는 runtime proxy**라는 점이다.
