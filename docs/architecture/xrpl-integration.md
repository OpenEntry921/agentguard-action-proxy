# XRPL Integration

## 다루는 XRPL 기능

- Payment 트랜잭션
- `account_info` 조회
- `account_lines` 조회
- `account_tx` 조회
- Memo 기록/앵커링
- Trustline 검증

## 자산 유형별 처리

- XRP는 XRPL native asset이므로 Trustline이 필요하지 않다.
- RLUSD 같은 issued token은 Trustline 검증이 필요하다.

## 통합 원칙

AgentGuard는 XRPL 기능을 대체하지 않고, XRPL 실행 전에 정책 검증과 승인 흐름을 추가하는 방식으로 통합한다.
