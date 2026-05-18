# 레거시 DID 프로젝트 적용 전략 (Legacy DID Project Adaptation)

업로드된 레거시 DID 문서는 전형적인 DID + VC/VP 백엔드 흐름을 다룹니다.

- Admin / Issuer / Holder / Verifier 사용자 모델
- `did:key` DID Documents
- Verifiable Credential 발급
- Verifiable Presentation 제출
- domain/challenge 기반 검증자 흐름
- QR 챌린지 흐름

AgentGuard는 이 구조에서 재사용 가능한 요소를 가져오되, **행위 통제 중심 시나리오에 맞게 액터와 의미를 재정의**했습니다.

## 액터 매핑 (Actor Mapping)

| Legacy DID System | AgentGuard Project |
|---|---|
| Issuer | Organization / Policy Issuer |
| Holder | AI Agent DID |
| Verifier | Execution Gateway |
| Credential | Policy Credential |
| Presentation | Action Presentation |
| Domain | Gateway Domain |
| Challenge | One-time Action Challenge |

## 왜 중요한가 (Why This Matters)

기존 DID 프로젝트는 학력/자격 같은 신원 주장(identity claim)을 검증하는 데 강합니다.

반면 AgentGuard가 필요한 주장은 다음과 같습니다.

> 이 AI Agent는 해당 정책 범위 안에서, 제한된 액션만 수행할 수 있다.

## 적용된 흐름 (Adapted Flow)

```text
Organization DID
    ↓ issues
Policy VC
    ↓ held by
AI Agent DID
    ↓ presents to
Execution Gateway
    ↓ gateway verifies challenge/domain
Action Token issued
    ↓
Execution Proxy performs action
    ↓
Verifiable Action Log
```

## 유지한 요소 (What Was Kept)

- DID Document 개념
- Ed25519 키 모델
- VC/VP 구조
- verifier domain/challenge 바인딩
- 재사용 공격 완화용 challenge 흐름

## 변경한 요소 (What Was Changed)

- Holder를 사람 사용자에서 AI Agent로 전환
- Credential type을 `AgentPolicyCredential`로 전환
- Presentation type을 `AgentActionPresentation`로 전환
- 액션 실행 전에 검증이 선행되도록 재구성
- 감사 로그를 Merkle-anchorable evidence로 활용

## 아직 MVP인 부분 (What Is Still MVP)

현재 구현은 의도적으로 최소 범위입니다. 운영 환경에서는 다음 보강이 필요합니다.

- W3C DID Core compliant DID method
- full VC Data Model compatibility
- credential revocation/status list
- DID document versioning
- issuer signature verification
- holder presentation signature verification via resolved DID Document
- challenge expiration enforcement
- XRPL anchoring for credential/log hashes
