# Decision Model

## 점수 구간

### 0~30: APPROVED
- 안전 구간
- 즉시 실행 가능

### 31~69: CONDITIONAL_APPROVAL
- 조건부 승인 구간
- 즉시 실행이 아니라 Confirm 후 실행
- 웹에서 Confirm Execution 필요
- Confirm 후 XRPL submit
- TX Hash 생성

### 70~100: BLOCKED
- 실행 차단
- token 발급 금지
- XRPL submit 금지

## 우선순위 규칙

`blocked_conditions`는 risk score보다 우선한다.

즉, 점수가 낮아도 차단 조건이 참이면 BLOCKED 처리한다.

예:
- `invalid_destination`
- `account_not_found`
- `blacklisted_wallet`
- `trustline_missing`
- `issuer_not_allowed`
- `currency_not_allowed`
