# Carbon Assetization Architecture

## 1. 문서 목적

본 문서는 REGEN 기반 탄소 자산화 플랫폼을 정의한다. 현재 단계에서는 구현이 아니라 고객 제안, 플랫폼 설계, 탄소 사업 확장 논의를 위한 기준 문서로 사용한다.

## 2. 전체 흐름

```text
Telemetry Collection
↓
Carbon Reduction Calculation
↓
Data Verification
↓
Carbon Credit Issuance
↓
Tokenization
↓
Reward Settlement
```

## 3. Telemetry Collection

기기, 차량, 에너지 설비, 센서에서 발생하는 원천 데이터를 수집한다. 수집 데이터는 Device Identity Gateway의 서명 검증 및 credential 상태와 연결된다.

## 4. Carbon Reduction Calculation

검증 가능한 원천 데이터를 기반으로 기준 배출량, 실제 배출량, 감축량을 계산한다. 계산은 프로젝트별 방법론과 기간, 기기 유형, 활동 유형을 반영한다.

## 5. Data Verification

데이터 무결성, 중복 제출 여부, 방법론 적합성, 이상치, 데이터 lineage를 검증한다. 검증 결과는 탄소 크레딧 발행과 보상 정산의 전제 조건이다.

## 6. Carbon Credit Issuance

검증된 감축량을 탄소 크레딧 발행 요청 단위로 구성한다. 이 단계는 외부 registry 또는 검증기관과의 연계를 고려하되, 현재 문서 단계에서는 내부 발행 준비 구조를 정의한다.

## 7. Tokenization

탄소 크레딧 또는 감축 실적을 토큰화 가능한 자산 메타데이터로 변환한다. 토큰화는 향후 RWA, STO, marketplace 연계의 기반이 된다.

## 8. Reward Settlement

자산화 결과와 계약 조건에 따라 기기 소유자, 사용자, 프로젝트 운영사, 파트너에게 보상을 배분한다.

## 9. 핵심 함수

```ts
ingestDeviceTelemetry(deviceId, telemetryPayload)
calculateCarbonReduction(verifiedTelemetry, methodologyId)
validateCarbonMethodology(calculationResult, methodologyId)
issueCarbonCredit(projectId, verifiedReduction)
tokenizeCarbonAsset(carbonCreditId, assetMetadata)
distributeReward(assetId, settlementRule)
```

## 10. 함수 정의

### ingestDeviceTelemetry()

기기 telemetry를 수집하고 timestamp, location, signature, device credential 상태와 함께 저장 가능한 이벤트로 정규화한다.

### calculateCarbonReduction()

기준 배출량과 실제 배출량을 비교하여 탄소 감축량을 산정한다.

### validateCarbonMethodology()

감축량 계산이 프로젝트 방법론, 기간, 데이터 품질 기준을 충족하는지 검증한다.

### issueCarbonCredit()

검증된 감축량을 탄소 크레딧 발행 요청 또는 내부 credit record로 전환한다.

### tokenizeCarbonAsset()

탄소 credit record와 메타데이터를 기반으로 토큰화 가능한 자산 단위를 생성한다.

### distributeReward()

정산 규칙과 참여자 정보를 기반으로 보상 배분 내역을 생성한다.

## 11. 주요 데이터 모델

| 데이터 | 설명 |
| --- | --- |
| Telemetry Record | 기기에서 수집된 원천 데이터 |
| Methodology ID | 탄소 감축 산정 방법론 식별자 |
| Reduction Calculation | 기준 배출량, 실제 배출량, 감축량 계산 결과 |
| Verification Result | 데이터 및 방법론 검증 결과 |
| Carbon Credit Record | 발행 준비 또는 발행된 탄소 credit 기록 |
| Asset Metadata | 토큰화 가능한 자산 설명 정보 |
| Reward Allocation | 참여자별 보상 배분 결과 |

## 12. OpenEntry Platform 내 역할

Carbon Assetization Architecture는 Carbon Verification Engine, Assetization Engine, Settlement Orchestrator, Reward & Reporting Engine을 연결하는 핵심 사업 아키텍처이다.
