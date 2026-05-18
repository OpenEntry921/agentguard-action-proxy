# Runtime Governance

## 핵심 철학

AgentGuard는 AI Agent의 실행 권한을 직접 신뢰하지 않고, 실행 이전에 정책으로 검증한다. 핵심은 "빠른 자동화"보다 "통제 가능한 자동화"다.
AgentGuard는 단순 wallet firewall이 아니라, DID와 XRPL signer account를 연결해 실행 권한을 정책적으로 통제하는 Runtime Governance System이다.

## 직접 실행 차단 구조

- AI Agent는 요청(Request)을 생성한다.
- 실제 실행 권한은 AgentGuard Runtime이 가진다.
- Runtime은 정책/리스크/조건을 통과한 경우에만 실행 경로를 연다.

## Policy Runtime의 사전 판단

실행 전에 다음을 판단한다.
- 요청 주체(DID/Agent) 적합성
- 대상 계정/자산 정책 적합성
- 위험 점수 및 차단 조건
- 조건부 승인 필요 여부

## Runtime Governance vs 모니터링

- 모니터링: 실행 후 탐지/경보 중심
- Runtime Governance: 실행 전 허용/차단 결정 중심

**AgentGuard는 탐지 시스템이 아니라 실행 통제 시스템이다.**
