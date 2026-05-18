# 레거시 DID 프로젝트 적용 전략 (Legacy DID Project Adaptation)

## 목적

이 문서는 레거시 DID/VC/VP 설명을 AgentGuard Action Proxy의 현재 포지셔닝에 맞게 재해석한다. AgentGuard는 DID 프로젝트가 아니라 **AI Runtime Execution Governance / Action Proxy** 프로젝트다.

## 레거시 DID 요소의 현재 역할

| Legacy DID System | AgentGuard Action Proxy에서의 역할 |
|---|---|
| Issuer | Optional policy issuer / trust source |
| Holder | AI Agent 또는 agent runtime context |
| Verifier | AgentGuard Gateway / Runtime |
| Credential | Optional policy evidence |
| Presentation | Optional action evidence presentation |
| Domain | Gateway domain binding |
| Challenge | One-time anti-replay context |

## 왜 재포지셔닝이 필요한가

기존 DID 프로젝트는 학력/자격 같은 신원 주장(identity claim)을 검증하는 데 강하다. AgentGuard가 다루는 핵심 질문은 다르다.

> 이 AI Agent의 액션 요청을 지금, 이 조건에서, 이 외부 시스템에 실행해도 되는가?

이 질문은 DID 검증만으로 해결되지 않는다. 정책 평가, 위험 점수, 조건부 승인, transient token, 감사 기록이 함께 필요하다.

## 적용된 흐름 (Adapted Flow)

```text
AI Agent action request
    ↓
Optional identity / policy evidence
    ↓
AgentGuard Gateway
    ↓
Policy + Risk Decision
    ↓
Conditional Approval if needed
    ↓
Transient Execution Token
    ↓
Execution Proxy performs controlled action
    ↓
Audit Receipt / Action Log
```

## 유지한 요소 (What Was Kept)

- DID Document 개념은 optional identity adapter로 유지
- Ed25519 키 모델은 서명/검증 후보로 유지
- VC/VP 구조는 policy evidence format 후보로 유지
- verifier domain/challenge 바인딩은 replay protection 보강 수단으로 유지

## 변경한 요소 (What Was Changed)

- 중심을 DID issuance에서 runtime execution decision으로 이동
- Holder 중심 설명을 AI Agent action context 중심으로 변경
- Credential을 실행 권한 자체가 아니라 policy evidence로 재정의
- Presentation을 core flow가 아니라 선택적 증거 제출로 재정의
- 감사 로그를 ledger 종속 구조가 아니라 runtime audit receipt로 재정의

## 아직 MVP인 부분 (What Is Still MVP)

현재 구현은 의도적으로 최소 범위의 runtime governance demo다. 운영 환경에서는 다음 보강이 필요하다.

- production-grade identity adapter
- credential revocation/status list
- issuer signature verification
- holder presentation signature verification
- challenge expiration enforcement
- append-only audit store
- optional ledger anchoring for audit evidence
