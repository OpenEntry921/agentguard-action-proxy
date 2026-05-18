# Demo Flow

## 데모 목적

이 데모는 AgentGuard Action Proxy가 AI runtime action request를 실행 전에 통제하는 흐름을 보여준다.

## 흐름

1. 요청 Preview 확인
2. Execute 요청
3. Policy Evaluation / Risk Evaluation 수행
4. Decision 확인
   - APPROVED
   - CONDITIONAL_APPROVAL
   - BLOCKED
5. 조건부 승인인 경우 Confirm Execution 수행
6. 승인된 요청만 Controlled Execution 진행
7. 실행 결과와 감사 레코드 확인

## 확인 포인트

- Agent가 직접 외부 시스템을 호출하지 않는다.
- policy/risk decision이 실행 전에 만들어진다.
- blocked request는 token과 실행 결과를 만들지 않는다.
- conditional request는 사람 확인 전까지 실행되지 않는다.
- audit receipt는 request, decision, result를 연결한다.

## XRPL 데모의 의미

XRPL submit이 활성화된 경우에도 데모의 핵심은 XRPL 자체가 아니라 **submit 이전에 AgentGuard runtime decision이 강제된다**는 점이다.
