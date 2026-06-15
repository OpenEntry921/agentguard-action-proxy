# OpenEntry Platform Architecture v1

## 1. 문서 목적

OpenEntry Platform은 AgentGuard와 Settlement Orchestrator를 중심으로 Device Identity, Carbon Verification, Assetization, Reward & Reporting을 하나의 상위 플랫폼으로 묶는 설계 개념이다.

본 문서는 현재 구현 범위를 확장하기 위한 개발 명세가 아니라, 고객 제안과 수주 대응을 위한 플랫폼 마스터 설계서이다.

## 2. 플랫폼 설계 원칙

- 새로운 Repository를 생성하지 않고 `agentguard-action-proxy`를 중심 Repository로 활용한다.
- 현재 단계에서는 신규 소스코드 디렉토리나 런타임 모듈을 생성하지 않는다.
- Device Identity, Carbon Assetization, STO, Settlement, AgentGuard 확장은 문서 기반으로 먼저 정의한다.
- 고객에게는 OpenEntry Platform이라는 상위 플랫폼과 하위 제품군으로 설명한다.

## 3. 전체 레이어 구조

```text
Device / Asset Data Layer
↓
Identity & Attestation Layer
↓
Data Verification Layer
↓
Assetization Layer
↓
AgentGuard Governance Layer
↓
Settlement Orchestration Layer
↓
Reward & Reporting Layer
```

## 4. Layer 1: Device / Asset Data Layer

### 목적

현장 기기, 차량, 센서, 에너지 설비, 탄소 감축 활동에서 발생하는 원천 데이터를 수집하고 표준화한다.

### 역할

- 기기 및 자산의 원천 이벤트 수집
- 탄소 감축, 에너지 사용량, 위치, 운행, 생산량 등 측정 데이터 확보
- 상위 레이어에서 검증 가능한 데이터 스키마 제공

### 핵심 기능

- Device telemetry ingestion
- Asset event registration
- Sensor data normalization
- Timestamp and location metadata capture
- Raw data integrity preservation

### 주요 API

```ts
ingestTelemetry(payload)
registerAssetEvent(event)
normalizeSensorData(rawData)
getDeviceData(deviceId, timeRange)
```

### 주요 데이터

- Device ID
- Asset ID
- Telemetry payload
- Timestamp
- Location metadata
- Sensor signature
- Raw measurement record

## 5. Layer 2: Identity & Attestation Layer

### 목적

기기, 사용자, 차량, 자산의 신원을 정의하고 신뢰 가능한 출처와 소유 관계를 증명한다.

### 역할

- Device DID 발급
- Device Credential 관리
- 기기 출처 및 제조 정보 증명
- 사용자-기기, 차량-기기, 자산-기기 바인딩

### 핵심 기능

- Device DID issuance
- Device credential lifecycle management
- Device origin attestation
- Device signature verification
- Binding registry management

### 주요 API

```ts
issueDeviceDID(deviceProfile)
verifyDeviceSignature(deviceId, signature, payload)
attestDeviceOrigin(deviceId, originEvidence)
bindDeviceToUser(deviceId, userId)
bindDeviceToVehicle(deviceId, vehicleId)
```

### 주요 데이터

- Device DID
- Device Credential
- Public key
- Attestation evidence
- User binding record
- Vehicle binding record
- Credential status

## 6. Layer 3: Data Verification Layer

### 목적

수집된 데이터가 위변조되지 않았고, 방법론과 정책에 부합하며, 자산화 또는 정산에 사용할 수 있는 수준인지 검증한다.

### 역할

- 데이터 무결성 검증
- 서명 검증
- 정책 기반 검증
- 탄소 방법론 검증
- 이상치 및 중복 데이터 탐지

### 핵심 기능

- Signature validation
- Methodology validation
- Data lineage validation
- Duplicate detection
- Anomaly and drift detection

### 주요 API

```ts
verifyDataIntegrity(record)
validateMethodology(record, methodologyId)
detectDuplicateSubmission(record)
evaluateDataRisk(record)
createVerificationResult(recordId)
```

### 주요 데이터

- Verification result
- Methodology ID
- Risk score
- Data lineage
- Validation evidence
- Rejection reason
- Audit trace

## 7. Layer 4: Assetization Layer

### 목적

검증된 데이터와 감축 실적을 탄소 크레딧, RWA, STO 연계 자산 등으로 전환할 수 있는 자산화 구조를 정의한다.

### 역할

- 탄소 감축량 산정
- 탄소 크레딧 발행 준비
- 토큰화 가능한 자산 단위 정의
- 자산 메타데이터와 권리 관계 관리

### 핵심 기능

- Carbon reduction calculation
- Credit issuance request
- Asset metadata generation
- Tokenization preparation
- Ownership and claim registry

### 주요 API

```ts
calculateCarbonReduction(verifiedData)
issueCarbonCredit(calculationResult)
createAssetMetadata(assetInput)
tokenizeCarbonAsset(assetId)
registerAssetClaim(assetId, ownerId)
```

### 주요 데이터

- Carbon reduction amount
- Carbon methodology
- Credit issuance record
- Asset metadata
- Tokenization status
- Ownership claim
- Asset lifecycle state

## 8. Layer 5: AgentGuard Governance Layer

### 목적

AI Agent, 자동화 워크플로, API 실행, 정산 요청, 자산화 요청이 정책과 위험 기준을 준수하는지 통제한다.

### 역할

- 정책 기반 실행 통제
- 위험 점수 산정
- 실행 토큰 발급
- Drift Detection
- Audit Evidence 생성

### 핵심 기능

- Policy evaluation
- Risk scoring
- Execution token issuance
- Drift pattern detection
- Audit trail generation
- Behavior Pattern Taxonomy 관리

### 주요 API

```ts
evaluatePolicy(actionContext)
calculateRiskScore(actionContext)
issueExecutionToken(policyResult)
detectBehaviorDrift(agentHistory)
recordAuditEvent(event)
```

### 주요 데이터

- Policy rule
- Risk score
- Execution token
- Agent context
- Behavior pattern
- Audit event
- Decision evidence

## 9. Layer 6: Settlement Orchestration Layer

### 목적

자산화 결과, 서비스 사용량, 보상 조건, 계약 조건을 기준으로 정산 프로세스를 조율한다.

### 역할

- 정산 조건 평가
- 지급 대상 및 금액 계산
- 정산 이벤트 생성
- 외부 지급 시스템 연동 준비
- 정산 감사 기록 관리

### 핵심 기능

- Settlement rule evaluation
- Payment instruction generation
- Multi-party allocation
- Contract-based settlement
- Settlement audit logging

### 주요 API

```ts
evaluateSettlementRule(settlementInput)
calculateAllocation(assetId, participants)
createSettlementInstruction(result)
confirmSettlementStatus(settlementId)
recordSettlementAudit(event)
```

### 주요 데이터

- Settlement rule
- Allocation result
- Payment instruction
- Participant account
- Settlement status
- Contract reference
- Audit record

## 10. Layer 7: Reward & Reporting Layer

### 목적

기여자, 사용자, 기기 소유자, 파트너에게 보상 결과와 검증 리포트를 제공한다.

### 역할

- 보상 내역 계산 및 표시
- 고객 제안용 리포트 생성
- ESG, REGEN, 탄소 감축 성과 리포팅
- 운영 지표와 감사 증적 제공

### 핵심 기능

- Reward summary generation
- Carbon impact reporting
- Customer proposal reporting
- Audit evidence packaging
- KPI dashboard feed

### 주요 API

```ts
generateRewardReport(userId, period)
generateCarbonImpactReport(assetId)
exportAuditEvidence(scope)
getPlatformKPI(timeRange)
createCustomerProposalReport(customerId)
```

### 주요 데이터

- Reward record
- Carbon impact report
- ESG metric
- Audit evidence package
- Customer report
- KPI summary
- Reporting period

## 11. 고객 설명용 제품 구조

```text
OpenEntry Platform
├── AgentGuard
├── Device Identity Gateway
├── Carbon Verification Engine
├── Assetization Engine
├── Settlement Orchestrator
└── Reward & Reporting Engine
```

## 12. 현재 단계의 범위

- 문서화: 포함
- 아키텍처 정의: 포함
- 제품 포트폴리오 정의: 포함
- 수주 대응 준비: 포함
- 신규 Repository 생성: 제외
- 신규 소스코드 디렉토리 생성: 제외
- 런타임 구현: 제외
