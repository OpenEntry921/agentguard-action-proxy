# Policy Engine

## 정책 파일 역할

- `configs/policy.yaml`: 기준 정책(캐노니컬), 전체 실행 규칙의 중심
- `configs/risk_rules.yaml`: 위험 점수 계산 규칙
- `configs/trustline_policy.yaml`: issued token Trustline 요구/검증 규칙
- `configs/destination_policy.yaml`: 목적지 허용/차단 정책
- `configs/history_policy.yaml`: 과거 실행 이력 기반 조건 규칙

## 정책 병합 구조

실행 시점에는 단일 파일만 보는 방식이 아니라, 기준 정책 + 세부 정책을 결합해 최종 의사결정 입력을 만든다.

예시 개념:
1. 기본 한도/에이전트 규칙 로드
2. 목적지/자산 제약 결합
3. 위험 점수 규칙 적용
4. 차단 조건 우선 평가

## Policy Hot Reload 개념

정책 수정 시 서비스 재배포 없이 런타임에서 반영할 수 있도록 설계하는 개념이다. 현재 구현에서는 환경/구성 방식에 따라 반영 타이밍이 달라질 수 있으므로 운영 시 반영 전략을 명확히 두는 것이 필요하다.
