# Runtime Modes

## 모드 정의

- **LIVE**
  - 실제 외부 시스템 조회/제출이 가능한 운영형 모드
  - XRPL 연동을 활성화한 경우 account lookup과 submit이 가능하다.
- **MOCK**
  - 실제 submit 없이 시뮬레이션
  - 데모/개발용
- **TEST**
  - pytest용
  - 외부 네트워크 호출 금지

pytest 실행 시에는 TEST mode가 강제되어야 한다.

## 관련 환경 변수

- `USE_XRPL_LIVE_LOOKUP`: XRPL adapter의 실조회 사용 여부
- `USE_XRPL_SUBMIT`: XRPL adapter의 실제 제출 사용 여부
- `AGENTGUARD_POLICY_PATH`: 런타임에서 사용할 정책 파일 경로

## 포지셔닝

Runtime mode는 AgentGuard의 core governance flow를 바꾸지 않는다. 어떤 모드에서도 기본 흐름은 action request, policy/risk decision, conditional approval, transient token, controlled execution, audit receipt 순서다.
