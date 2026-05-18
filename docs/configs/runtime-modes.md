# Runtime Modes

## 모드 정의

- **LIVE**
  - 실제 XRPL account lookup 수행
  - 실제 XRPL submit 가능
- **MOCK**
  - 실제 submit 없이 시뮬레이션
  - 데모/개발용
- **TEST**
  - pytest용
  - 외부 XRPL 네트워크 호출 금지

pytest 실행 시에는 TEST mode가 강제되어야 한다.

## 관련 환경 변수

- `USE_XRPL_LIVE_LOOKUP`: XRPL 실조회 사용 여부
- `USE_XRPL_SUBMIT`: XRPL 실제 제출 사용 여부
- `AGENTGUARD_POLICY_PATH`: 런타임에서 사용할 정책 파일 경로
