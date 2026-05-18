# Conditional Approval

## 정의

`CONDITIONAL_APPROVAL`은 자동 실행을 멈추고 사람 확인을 요구하는 중간 승인 상태다.

## 왜 필요한가

- 정상 패턴과 이상 패턴의 경계 구간(31~69점)을 안전하게 처리하기 위해
- 완전 차단(BLOCKED) 전 단계에서 운영자 판단을 반영하기 위해

## 실행 절차

1. 조건부 승인 판정
2. Confirm Execution 요청
3. 사람 확인 완료
4. XRPL Submit 수행
5. TX Hash 생성 및 기록

## 보안/감사 관점

- 승인 이벤트를 감사 로그에 남겨 추적성을 강화한다.
- Confirm 이후에도 재실행 공격을 막기 위해 Replay Protection이 필요하다.
