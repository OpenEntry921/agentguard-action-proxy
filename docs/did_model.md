# DID 모델 (DID Model)

## 포지셔닝

AgentGuard의 중심은 DID가 아니라 **AI Runtime Execution Governance**다. DID는 agent identity, issuer trust, policy evidence를 표현할 수 있는 선택적 identity adapter다.

즉, AgentGuard는 DID 없이도 policy/risk/approval 기반 실행 통제를 수행할 수 있다. DID를 사용하는 경우에도 DID는 실행 권한 자체가 아니라 실행 전 판단에 필요한 신뢰 근거 중 하나다.

## DID가 답할 수 있는 질문

DID를 도입하면 다음 질문에 대한 근거를 강화할 수 있다.

- 이 요청을 만든 agent identity는 무엇인가?
- 이 agent는 어떤 조직 또는 policy issuer와 연결되어 있는가?
- policy evidence 또는 credential은 어떤 주체가 발행했는가?
- verifier challenge/domain이 재사용 공격을 줄이는가?

## DID가 답하지 않는 질문

DID만으로는 다음을 결정하지 않는다.

- 이 액션을 지금 실행해도 되는가?
- destination, asset, amount, API action이 정책 범위 안인가?
- risk score가 조건부 승인 또는 차단 구간인가?
- transient token을 발급해도 되는가?

이 질문들은 AgentGuard Runtime의 policy engine과 decision model이 판단한다.

## 선택적 배치 구조

```text
AI Agent
   ↓ presents optional identity / policy evidence
AgentGuard Gateway
   ↓ evaluates policy and risk
Decision Model
   ↓ issues transient execution token if allowed
Execution Proxy
   ↓ performs controlled action
Audit Receipt
   ↓ optional DID / ledger / Merkle evidence
```

## XRPL DID의 역할

XRPL DID를 사용하는 경우, XRPL은 신뢰 앵커가 될 수 있다.

- Organization DID
- AI Agent DID
- Gateway DID
- DID Document reference
- DID lifecycle/update 추적

하지만 XRPL DID는 AgentGuard의 필수 구성요소가 아니다. XRPL DID를 사용하더라도 최종 실행 허용 여부는 AgentGuard의 runtime decision이 결정한다.

## VC/VP 흐름의 재해석

기존 DID 프로젝트에서 VC/VP는 신원 주장 검증에 강하다. AgentGuard에서의 관심사는 다음 주장이다.

> 이 AI Agent는 특정 runtime policy 안에서 제한된 액션만 요청할 수 있다.

따라서 VC/VP는 core execution flow가 아니라 policy evidence format으로 볼 수 있다.

```text
Organization / Policy Issuer
   ↓ issues optional policy credential
AI Agent
   ↓ presents credential/evidence
AgentGuard Runtime
   ↓ verifies evidence as one input
Policy + Risk Decision
   ↓
Controlled Execution
```

## 현재 MVP 경계

현재 구현은 의도적으로 runtime governance demo에 초점을 둔다. 운영 환경에서 DID를 핵심 trust adapter로 확장하려면 다음 보강이 필요하다.

- W3C DID Core compliant DID method
- full VC Data Model compatibility
- credential revocation/status list
- DID document versioning
- issuer signature verification
- holder presentation signature verification via resolved DID Document
- challenge expiration enforcement
- optional XRPL anchoring for credential/log hashes
