# Risk Scoring

## risk_score 의미

`risk_score`는 요청의 상대적 위험도를 0~100 범위로 수치화한 값이다.

## risk_flags 의미

`risk_flags`는 점수 산정에 영향을 준 근거 태그다. 운영자는 점수뿐 아니라 "왜 이 점수가 나왔는지"를 플래그로 확인해야 한다.

## 주요 플래그 예시

- `new_destination`: 신규 목적지 전송
- `after_hours_execution`: 비업무 시간 실행
- `frequency_spike`: 짧은 시간 내 빈도 급증
- `split_transaction_risk`: 분할 전송으로 한도 우회 시도 의심
- `amount_limit_exceeded`: 정책 한도 초과
- `destination_account_not_found`: 대상 계정 조회 실패
