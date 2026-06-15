# Device Identity Gateway Proposal

## 1. 제안 목적

본 문서는 Device Identity 사업을 위한 고객 제안용 문서이다. Device Identity Gateway는 OpenEntry Platform의 기기 신원, 인증, attestation, binding 기능을 담당한다.

## 2. 고객 문제

- 기기 데이터의 출처를 검증하기 어렵다.
- 센서 또는 게이트웨이의 위변조 여부를 판단하기 어렵다.
- 사용자, 차량, 기기 간 관계가 표준화되어 있지 않다.
- 기기 간 인증과 데이터 교환 신뢰 체계가 부족하다.

## 3. 제안 제품

Device Identity Gateway는 다음 기능을 제공한다.

- Device DID
- Device Credential
- Device Attestation
- Device Signature Verification
- Device-to-Device Authentication
- User-Device Binding
- Vehicle-Device Binding

## 4. 주요 API 개념

```ts
issueDeviceDID()
verifyDeviceSignature()
attestDeviceOrigin()
authenticateDevicePair()
bindDeviceToUser()
bindDeviceToVehicle()
```

## 5. 적용 시나리오

### IoT 데이터 검증

센서와 게이트웨이가 제출하는 데이터를 Device DID와 서명으로 검증한다.

### 차량 데이터 사업

차량에 설치된 기기와 차량 식별자를 binding하여 운행, 배터리, 탄소 감축 데이터를 신뢰 가능한 데이터로 전환한다.

### 탄소 플랫폼 연계

Carbon Verification Engine이 검증 가능한 device telemetry를 입력으로 사용할 수 있도록 한다.

## 6. 기대 효과

- 기기 데이터 신뢰성 강화
- 데이터 위변조 위험 감소
- 사용자 및 차량 기반 서비스 확장
- 탄소 검증과 정산의 기반 데이터 품질 확보

## 7. 추진 단계

| 단계 | 목표 | 산출물 |
| --- | --- | --- |
| 1단계 | 기기 신원 모델 정의 | DID, Credential, Binding 모델 |
| 2단계 | Attestation 구조 정의 | 제조사, 펌웨어, 보안 모듈 증명 구조 |
| 3단계 | 인증 흐름 정의 | signature verification, device pair authentication |
| 4단계 | 플랫폼 연계 정의 | Carbon, Settlement, Reporting 연계 구조 |
