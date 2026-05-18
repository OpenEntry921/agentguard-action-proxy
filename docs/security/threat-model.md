# Threat Model

## 주요 위협

- unknown DID 공격
- 정책 우회 시도
- AI Agent runaway execution(비정상 자동 반복 실행)
- replay attack
- invalid destination 입력
- malicious issued token 유입

## 대응 방향

- DID/Agent 정책 검증 선행
- blocked_conditions 우선 차단
- 조건부 승인 + 사람 확인 경로
- transient token + nonce + 만료시간 검증

## Prompt Injection 관련 주의

prompt injection은 runtime policy와 별도 분석 레이어에서 다룬다. 즉, 프롬프트 안전성 분석과 실행 정책 통제는 서로 보완 관계로 설계한다.
