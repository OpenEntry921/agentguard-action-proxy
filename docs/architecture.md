# 아키텍처 (Architecture)

## 시스템 구조 (System Structure)

```text
XRPL DID Ledger
   ↓
XRPL DID Resolver
   ↓
DID Document
   ↓
Policy Credential / VC
   ↓
AgentGuard Gateway
   ↓
Policy Engine
   ↓
Transient Action Token
   ↓
Execution Proxy
   ↓
External System
   ↓
Verifiable Action Log
   ↓
Merkle Root
   ↓
XRPL Anchor
```

---

## 역할 분리 (Role Separation)

### XRPL

XRPL은 신뢰 앵커(Trust Layer)로 사용됩니다.

- Agent DID 신뢰 기준점
- 조직 DID 신뢰 기준점
- DID Document 참조 무결성
- 감사 Merkle Root 앵커

중요: XRPL 자체가 정책 엔진 역할을 하지는 않습니다.

### AgentGuard

AgentGuard는 행위 통제 계층입니다.

- 정책 검증
- 액션 경계 강제
- 1회성 Action Token 발급
- 실행 프록시 제어
- 감사 로그 생성

---

## 핵심 원칙 (Core Principle)

```text
Identity ≠ Authorization
Authorization ≠ Execution
Execution ≠ Proof
```

AgentGuard는 이 책임들을 의도적으로 분리합니다.

---

## DID 흐름 (DID Flow)

```text
Organization DID on XRPL
    ↓ delegates / issues VC
AI Agent DID on XRPL
    ↓ presents Policy Credential
Execution Gateway
    ↓ verifies policy and challenge
Action Token Issuer
    ↓ issues one-time token
Execution Proxy
    ↓ performs external action
Audit Log
    ↓ creates Merkle Root
XRPL Anchor
```

---

## 실행 흐름 (Execution Flow)

```text
1. Agent requests action
2. Gateway resolves Agent DID
3. Gateway checks Policy Credential
4. Policy Engine validates action context
5. Token Issuer creates one-time Action Token
6. Execution Proxy consumes token
7. Proxy calls external API
8. Audit Log records result
9. Merkle Root is prepared for XRPL anchoring
```

---

## XRPL DID를 쓰는 이유 (Why XRPL DID)

XRPL DID 없이도 로컬 MVP는 동작할 수 있습니다.  
하지만 DID 레지스트리를 애플리케이션이 단독으로 통제하면, 기업/기관 관점에서 신뢰성이 약해집니다.

XRPL DID를 적용하면 다음이 가능해집니다.

- Agent 신원을 외부에서 검증 가능
- 조직 신원을 외부에서 검증 가능
- DID Document 참조를 독립적으로 검증 가능
- 앱 DB를 신뢰하지 않아도 감사 앵커 검증 가능

---

## 핵심 인사이트 (Key Insight)

> XRPL은 “누가(Who)”인지를 증명하고,  
> AgentGuard는 “무엇을(What)” 할 수 있는지를 통제합니다.
