# OpenEntry Product Portfolio

## 1. 문서 목적

본 문서는 고객 제안과 사업 개발 과정에서 OpenEntry Platform을 제품군 단위로 설명하기 위한 제품 카탈로그이다.

OpenEntry Platform은 AgentGuard, Device Identity Gateway, Carbon Verification Engine, Assetization Engine, Settlement Orchestrator, Reward & Reporting Engine으로 구성된다.

## 2. 제품 포트폴리오 요약

| 제품 | 핵심 가치 | 주요 고객 |
| --- | --- | --- |
| AgentGuard | AI Agent 실행 통제와 감사 | AI 서비스 기업, 플랫폼 사업자, 엔터프라이즈 |
| Device Identity Gateway | 기기 신원 및 인증 | IoT, 차량, 에너지, 제조 기업 |
| Carbon Verification Engine | 탄소 감축 데이터 검증 | REGEN, ESG, 탄소 플랫폼 사업자 |
| Assetization Engine | 검증 데이터의 자산화 | RWA, STO, 탄소 크레딧 사업자 |
| Settlement Orchestrator | 계약 기반 정산 조율 | 플랫폼, 마켓플레이스, 파트너 네트워크 |
| Reward & Reporting Engine | 보상 및 리포팅 | ESG 운영사, 커뮤니티, 고객사 |

## 3. AgentGuard

### 제품 설명

AgentGuard는 AI Agent와 자동화 시스템의 실행을 정책, 위험, 감사 기준으로 통제하는 거버넌스 제품이다.

### 해결 문제

- AI Agent의 무단 실행 위험
- 정책 위반 행동 탐지 부족
- 실행 이력과 감사 증적 부재
- Agent 행동 변화와 드리프트 관리 어려움

### 주요 기능

- Policy Engine
- Risk Engine
- Execution Token
- Drift Detection
- Audit Engine
- Behavior Pattern Taxonomy 기반 확장

### 예상 고객

- AI Agent 서비스 기업
- 금융, 보험, 헬스케어 등 규제 산업 기업
- API 자동화 플랫폼
- 엔터프라이즈 보안 조직

### 향후 확장성

- Agent Reputation
- Behavior Store
- Ontology
- Knowledge Graph
- Intent Analysis

## 4. Device Identity Gateway

### 제품 설명

Device Identity Gateway는 기기별 DID, Credential, Attestation, Signature Verification을 제공하는 기기 신원 관리 제품이다.

### 해결 문제

- 기기 출처 검증 부재
- 센서 데이터 위변조 위험
- 사용자, 차량, 기기 간 소유 및 사용 관계 불명확
- 기기 간 상호 인증 부재

### 주요 기능

- Device DID 발급
- Device Credential 관리
- Device Attestation
- Device Signature Verification
- Device-to-Device Authentication
- User-Device Binding
- Vehicle-Device Binding

### 예상 고객

- IoT 플랫폼 기업
- 차량 데이터 사업자
- 에너지 및 스마트시티 기업
- 제조사 및 기기 공급사

### 향후 확장성

- 제조사 Credential 연동
- 차량 및 배터리 Passport 연계
- 글로벌 DID 표준 연계
- 탄소 데이터 검증과 결합

## 5. Carbon Verification Engine

### 제품 설명

Carbon Verification Engine은 기기 데이터와 운영 데이터를 기반으로 탄소 감축량을 계산하고 검증하는 제품이다.

### 해결 문제

- 탄소 감축 데이터의 신뢰성 부족
- 방법론 검증과 데이터 추적성 부족
- 수작업 중심의 MRV 비용 증가
- 탄소 크레딧 발행 전 검증 체계 부재

### 주요 기능

- Telemetry Collection
- Carbon Reduction Calculation
- Data Verification
- Methodology Validation
- Audit Evidence 생성

### 예상 고객

- REGEN 플랫폼
- ESG 솔루션 기업
- 탄소 크레딧 사업자
- 에너지 절감 서비스 기업

### 향후 확장성

- 자동화 MRV
- 외부 검증기관 연계
- Carbon Credit Issuance 연동
- Reward Settlement 연계

## 6. Assetization Engine

### 제품 설명

Assetization Engine은 검증된 탄소 감축 실적과 실물 기반 데이터를 토큰화 가능한 자산 단위로 전환하는 제품이다.

### 해결 문제

- 검증 데이터와 금융 자산 간 연결 구조 부재
- 탄소 크레딧, RWA, STO 확장 설계 부족
- 자산 권리 관계와 메타데이터 관리 어려움

### 주요 기능

- Carbon Credit Issuance 준비
- Asset Metadata 생성
- Tokenization 설계
- Ownership Claim Registry
- Asset Lifecycle 관리

### 예상 고객

- RWA 플랫폼
- STO 사업자
- 탄소 크레딧 거래 사업자
- 프로젝트 파이낸싱 운영사

### 향후 확장성

- STO Engine 연계
- RWA Marketplace 연계
- 온체인/오프체인 자산 증명
- 계약 기반 수익 분배

## 7. Settlement Orchestrator

### 제품 설명

Settlement Orchestrator는 계약 조건, 플랫폼 규칙, 자산화 결과를 기준으로 다자간 정산을 조율하는 제품이다.

### 해결 문제

- 참여자별 보상 계산 복잡성
- 계약 조건 기반 정산 자동화 부족
- 정산 이력과 감사 증적 관리 어려움
- 외부 지급 시스템 연동 전 표준화 부재

### 주요 기능

- Settlement Rule Evaluation
- Multi-party Allocation
- Payment Instruction Generation
- Settlement Status Tracking
- Settlement Audit Logging

### 예상 고객

- 플랫폼 사업자
- 마켓플레이스 운영사
- 탄소/에너지 프로젝트 운영사
- 파트너 네트워크 기반 서비스 기업

### 향후 확장성

- 외부 지급 API 연동
- 스마트컨트랙트 연계
- 국가별 정산 규칙 확장
- 수익 배분 자동화

## 8. Reward & Reporting Engine

### 제품 설명

Reward & Reporting Engine은 사용자, 기기 소유자, 파트너에게 보상 결과와 운영 리포트를 제공하는 제품이다.

### 해결 문제

- 보상 산정 결과의 투명성 부족
- ESG 및 탄소 성과 리포팅 비용 증가
- 고객 제안과 운영 보고에 필요한 데이터 패키징 부족

### 주요 기능

- Reward Report 생성
- Carbon Impact Report 생성
- ESG Metric 관리
- Audit Evidence Export
- Customer Proposal Report 생성

### 예상 고객

- ESG 운영사
- REGEN 커뮤니티
- 탄소 프로젝트 운영사
- 플랫폼 고객사

### 향후 확장성

- 고객별 리포트 템플릿
- 대시보드 연동
- 투자자 보고 패키지
- 규제 보고 자동화
