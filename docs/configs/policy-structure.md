# Policy Structure

## Canonical Policy File

정책의 기준 파일은 `configs/policy.yaml`이다.

루트 `policy.yaml`은 더 이상 사용하지 않으며, 정책은 `configs/` 하위에서 관리한다.

## 주요 섹션

- `agent`
- `limits`
- `xrpl`
- `trustline_policy`
- `destination_policy`
- `history_policy`
- `risk_rules`
- `decision_thresholds`
- `blocked_conditions`
- `legacy_whitelist`

## legacy_whitelist

`legacy_whitelist`는 기존 정책/운영과의 호환성 목적 필드다.
