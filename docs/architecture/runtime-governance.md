# Runtime Governance

## 핵심 철학

AgentGuard는 AI Agent의 실행 권한을 직접 신뢰하지 않고, 실행 이전에 정책으로 검증한다. 핵심은 “빠른 자동화”보다 “통제 가능한 자동화”다.

AgentGuard Action Proxy는 wallet firewall이나 XRPL/DID 전용 미들웨어가 아니다. AgentGuard의 역할은 AI runtime에서 발생한 액션 요청을 정책, 위험도, 승인 상태, 감사 요구사항에 따라 허용하거나 차단하는 것이다.

## 직접 실행 차단 구조

- AI Agent는 요청(Request)을 생성한다.
- 실제 실행 권한은 AgentGuard Runtime이 가진다.
- Runtime은 정책/리스크/조건을 통과한 경우에만 실행 경로를 연다.
- 외부 시스템 호출은 Execution Proxy가 수행한다.

## Policy Runtime의 사전 판단

실행 전에 다음을 판단한다.

- 요청 주체 또는 agent context 적합성
- 대상 계정/자산/API/액션 정책 적합성
- 위험 점수 및 차단 조건
- 조건부 승인 필요 여부
- transient token 발급 가능 여부
- 감사 레코드에 남길 판단 근거

## Runtime Governance vs 모니터링

- 모니터링: 실행 후 탐지/경보 중심
- Runtime Governance: 실행 전 허용/차단 결정 중심

**AgentGuard는 탐지 시스템이 아니라 실행 통제 시스템이다.**

## XRPL/DID의 위치

XRPL과 DID는 runtime governance를 보강할 수 있는 adapter다.

- XRPL: controlled execution target, account lookup target, audit anchor target
- DID: agent identity 또는 issuer trust 표현 방식
- Signer account: 승인된 실행을 제출하는 서버 측 실행 주체

이 요소들은 AgentGuard의 core abstraction을 대체하지 않는다. core abstraction은 항상 **action request → decision → controlled execution → audit**이다.
