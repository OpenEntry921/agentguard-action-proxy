# Execution Flow

## End-to-End 흐름

```text
AI Agent Request
→ Policy Evaluation
→ Risk Evaluation
→ Decision
→ Conditional Approval (if needed)
→ Transient Execution Token
→ Controlled Execution
→ Execution Result
→ Audit Receipt
```

## 단계 설명

1. AI Agent Request: AI runtime이 실행 의도와 payload를 생성한다.
2. Policy Evaluation: 정책 파일을 기준으로 agent, destination, asset, action 범위를 검증한다.
3. Risk Evaluation: 요청 맥락의 위험 점수와 플래그를 계산한다.
4. Decision: APPROVED / CONDITIONAL_APPROVAL / BLOCKED를 결정한다.
5. Conditional Approval: 경계 구간 요청은 사람 확인 전까지 실행하지 않는다.
6. Transient Execution Token: 승인된 요청에 대해 1회성 실행 권한을 발급한다.
7. Controlled Execution: Execution Proxy가 외부 시스템에 제한된 액션을 수행한다.
8. Execution Result: 실행 대상에서 반환된 결과 식별자를 기록한다.
9. Audit Receipt: 요청, 판단 근거, 승인 상태, 실행 결과를 감사 레코드화한다.

## XRPL 실행 대상이 포함되는 경우

XRPL submit이 활성화된 데모에서는 `Controlled Execution` 단계가 XRPL Payment 제출로 이어질 수 있다. 그러나 flow의 핵심은 XRPL submit 자체가 아니라, submit 이전에 runtime decision이 강제된다는 점이다.
