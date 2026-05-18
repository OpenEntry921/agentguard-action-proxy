# XRPL Integration as an Execution Target

## 포지셔닝

XRPL은 AgentGuard의 정체성이 아니라 **controlled execution target** 중 하나다. AgentGuard는 XRPL 기능을 대체하지 않고, XRPL 실행 전에 정책 검증, 위험 평가, 조건부 승인, 감사 기록을 강제한다.

## 다루는 XRPL 기능

- Payment 트랜잭션 제출
- `account_info` 조회
- `account_lines` 조회
- `account_tx` 조회
- Memo 기록/앵커링
- Trustline 검증

## 자산 유형별 처리

- XRP는 XRPL native asset이므로 Trustline이 필요하지 않다.
- RLUSD 같은 issued token은 Trustline 검증이 필요하다.
- 자산별 차이는 policy/risk decision의 입력으로 사용된다.

## 통합 원칙

- AI Agent가 signer seed/private key를 직접 보유하지 않는다.
- AgentGuard가 승인한 요청만 XRPL 실행 경로로 전달된다.
- 조건부 승인 요청은 Confirm Execution 이후에만 submit 가능하다.
- 차단된 요청은 token 발급과 submit이 모두 금지된다.
- XRPL tx hash는 실행 결과 식별자로 감사 레코드에 연결된다.

## DID와 감사 앵커

XRPL DID나 Memo 기반 감사 앵커는 선택적 신뢰 보강 수단이다. 현재 문서 포지셔닝에서 DID/anchor는 core product가 아니라, governance decision과 audit trail을 더 강하게 증명하기 위한 adapter로 다룬다.
