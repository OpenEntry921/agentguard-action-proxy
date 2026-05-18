# Demo Flow

## 데모 실행 방법

1. 서버 실행
2. 브라우저 접속
3. 요청 입력 후 Preview 확인
4. Execute 수행

## Conditional Approval 시나리오

- 판정이 CONDITIONAL_APPROVAL이면 즉시 제출되지 않는다.
- 화면에서 Confirm Execution 수행 후 XRPL submit이 진행된다.
- 제출 성공 시 TX Hash를 확인한다.

## BLOCKED 시나리오

- blocked_conditions 또는 고위험 점수 구간이면 실행이 차단된다.
- 이 경우 token 발급/submit이 진행되지 않아야 한다.
