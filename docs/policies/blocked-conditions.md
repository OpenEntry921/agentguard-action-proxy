# Blocked Conditions

`blocked_conditions`는 점수와 무관하게 즉시 차단되는 조건이다.

즉, risk score가 APPROVED 구간이어도 차단 조건이 충족되면 실행은 BLOCKED 된다.

## 예시

- `unknown_agent`
- `invalid_destination`
- `account_not_found`
- `blacklisted_wallet`
- `trustline_missing`
- `issuer_not_allowed`
- `currency_not_allowed`
