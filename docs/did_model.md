# DID 모델 (DID Model)

## 핵심 아이디어 (Core Idea)

전통적인 시스템은 “사용자 인증”에 집중합니다.

AgentGuard는 한 단계 더 나아가 **실제로 행동을 수행하는 AI Agent의 신원과 권한**을 분리해 다룹니다.

```text
User login answers:
Who logged in?

Agent DID answers:
Which agent acted?
```

---

## DID 배치 구조 (DID Placement)

```text
User / Organization DID
        ↓ delegates
AI Agent DID
        ↓ receives
Policy Credential
        ↓ requests action
Action Token
        ↓ executes through proxy
Verifiable Action Log
        ↓ can be anchored
XRPL
```

---

## XRPL DID의 역할 (XRPL DID Role)

XRPL DID는 신뢰 앵커입니다.

다음 항목의 기준점으로 사용됩니다.

- Organization DID
- AI Agent DID
- Gateway DID
- DID Document reference
- DID lifecycle / update 추적

---

## AgentGuard의 역할 (AgentGuard Role)

AgentGuard는 XRPL DID를 대체하지 않습니다.

대신 XRPL DID 위에 **행위 제어(Action Control)**를 덧붙입니다.

```text
XRPL DID = Who
AgentGuard = What
```

더 명확히 말하면:

```text
XRPL proves who the agent is.
AgentGuard controls what the agent can do.
```

---

## DID Document

MVP는 최소 DID Document 모델을 지원합니다.

운영 단계(Production)에서는 XRPL DID 해석(Resolution) 체계가 필요합니다.

```text
did:xrpl:<account>
   ↓
XRPL DID object
   ↓
DID Document URI / data
   ↓
verification methods / service endpoints
```

---

## 정책 자격증명 (Policy Credential)

AI Agent DID는 정책 조건이 반영된 자격증명(credential)을 부여받습니다.

이 자격증명은 아래 질문에 답합니다.

- 누가 권한을 발급했는가?
- 어떤 Agent DID가 주체(subject)인가?
- 어떤 정책이 적용되는가?
- 어떤 액션이 허용되는가?
- 금액/가맹점/목적 제한은 무엇인가?
- 언제 만료되는가?

---

## 액션 프레젠테이션 (Action Presentation)

실행 전에 AI Agent는 정책 자격증명을 게이트웨이에 제시할 수 있습니다.

이는 VC/VP의 기본 흐름:

```text
Issuer → Holder → Verifier
```

을 아래처럼 실행 통제 문맥으로 확장한 형태입니다.

```text
Organization / Policy Issuer → AI Agent DID → Execution Gateway
```

---

## MVP vs Production

### MVP

- `did:agentguard:*`
- local DID registry
- local DID resolver
- local policy credential
- XRPL resolver stub

### Production

- `did:xrpl:*`
- XRPL DID resolver
- DID Document URI resolution
- VC/VP signature verification via DID Document
- credential status / revocation
- XRPL audit anchoring
