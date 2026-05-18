# Audit Model

## 핵심 필드

- `request_hash`: 요청 본문 무결성 식별
- `policy_hash`: 어떤 정책 버전/내용으로 판정했는지 식별
- `decision_id`: 판정 이벤트 식별자
- `tx_hash`: XRPL 제출 결과 식별자

## Audit Receipt

최종적으로 요청-판정-실행을 연결하는 receipt를 남겨 사후 추적이 가능해야 한다.

## 저장 원칙

- append-only audit 방향 유지
- 삭제/수정보다 누적 기록 중심

## 민감정보 원칙

Seed/private key는 절대 저장하지 않는다.
