# OpenEntry Platform v1 Proposal

## 1. 제안 목적

본 문서는 OpenEntry Platform을 통합 플랫폼으로 고객에게 설명하기 위한 제안서이다.

OpenEntry Platform은 AgentGuard와 Settlement Orchestrator를 기반으로 Device Identity, Carbon Verification, Assetization, Reward & Reporting을 결합한다.

## 2. 플랫폼 구성

```text
OpenEntry Platform
├── AgentGuard
├── Device Identity Gateway
├── Carbon Verification Engine
├── Assetization Engine
├── Settlement Orchestrator
└── Reward & Reporting Engine
```

## 3. 고객에게 제공하는 가치

- 기기와 자산 데이터의 신뢰성 확보
- AI Agent 및 자동화 실행의 거버넌스 제공
- 탄소 감축 데이터 검증과 자산화 기반 마련
- 계약 기반 정산과 보상 배분 체계화
- ESG, REGEN, 투자자 보고에 필요한 리포팅 제공

## 4. 핵심 제품 설명

### AgentGuard

AI Agent와 자동화 워크플로의 정책, 위험, 감사 통제를 담당한다.

### Device Identity Gateway

기기 DID, credential, attestation, signature verification을 제공한다.

### Carbon Verification Engine

기기 telemetry와 방법론을 기반으로 탄소 감축 데이터를 검증한다.

### Assetization Engine

검증된 감축 실적과 실물 데이터를 자산화 가능한 단위로 전환한다.

### Settlement Orchestrator

계약 조건과 참여자 역할에 따라 정산과 보상 배분을 조율한다.

### Reward & Reporting Engine

보상 결과, 탄소 성과, 감사 증적, 고객 리포트를 제공한다.

## 5. 적용 분야

- REGEN 탄소 플랫폼
- IoT 및 차량 데이터 플랫폼
- RWA 및 STO 연계 사업
- AI Agent Governance
- ESG 데이터 및 리포팅 서비스
- 파트너 기반 정산 플랫폼

## 6. 추진 단계

| 단계 | 목표 | 주요 산출물 |
| --- | --- | --- |
| Phase 1 | 플랫폼 제안 구조 확정 | Architecture, Product Portfolio, Proposal 문서 |
| Phase 2 | 고객별 제안 패키지 작성 | DATAM, Device Identity, 통합 플랫폼 제안서 |
| Phase 3 | PoC 범위 정의 | API 후보, 데이터 모델, 검증 시나리오 |
| Phase 4 | 구현 계획 수립 | Repository 확장 여부, 모듈 경계, 일정 계획 |

## 7. 현재 단계의 원칙

현재 단계는 설계와 수주 대응 준비 단계이다.

- 신규 Repository 생성 금지
- 신규 소스코드 디렉토리 생성 금지
- 구현보다 문서화 우선
- 고객 제안과 아키텍처 정의 우선
