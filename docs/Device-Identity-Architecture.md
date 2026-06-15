# Device Identity Architecture

## 1. 문서 목적

본 문서는 OpenEntry Platform의 기기 신원 관리 플랫폼을 정의한다. 현재 단계에서는 구현 명세가 아니라 Device Identity Gateway 제품과 관련 제안서의 기준 아키텍처로 사용한다.

## 2. 핵심 개념

Device Identity는 기기 자체의 고유 신원, 제조 및 출처 증명, 데이터 서명, 사용자 및 차량과의 바인딩 관계를 포함한다.

## 3. 구성 요소

### Device DID

Device DID는 기기별 분산 식별자이다. 기기가 생성하거나 플랫폼이 발급한 공개키와 연결되며, 데이터 서명 검증과 Credential 발급의 기준 식별자로 사용된다.

### Device Credential

Device Credential은 기기의 제조사, 모델, 시리얼, 인증 상태, 펌웨어 상태, 소유 관계 등을 표현하는 검증 가능한 자격 정보이다.

### Device Attestation

Device Attestation은 기기의 출처, 제조 정보, 펌웨어 무결성, 보안 모듈 상태를 증명하는 절차이다.

### Device Signature Verification

Device Signature Verification은 기기가 제출한 telemetry, 이벤트, 인증 요청의 서명이 유효한지 검증한다.

### Device-to-Device Authentication

Device-to-Device Authentication은 두 기기가 상호 인증을 수행하고, 신뢰 가능한 데이터 교환 또는 제어 요청을 허용하는 구조이다.

### User-Device Binding

User-Device Binding은 특정 사용자와 기기의 소유, 사용, 위임 관계를 등록한다.

### Vehicle-Device Binding

Vehicle-Device Binding은 차량과 기기, 센서, 배터리, 게이트웨이 간 관계를 등록한다.

## 4. 핵심 함수

```ts
issueDeviceDID(deviceProfile)
verifyDeviceSignature(deviceId, signature, payload)
attestDeviceOrigin(deviceId, originEvidence)
authenticateDevicePair(sourceDeviceId, targetDeviceId)
bindDeviceToUser(deviceId, userId, bindingContext)
bindDeviceToVehicle(deviceId, vehicleId, bindingContext)
```

## 5. 함수 정의

### issueDeviceDID()

기기 프로파일, 공개키, 제조 정보, 초기 credential 상태를 기반으로 Device DID를 발급한다.

### verifyDeviceSignature()

기기 DID에 연결된 공개키를 사용하여 telemetry 또는 인증 payload의 서명을 검증한다.

### attestDeviceOrigin()

제조사 증명, 공급망 증빙, 펌웨어 해시, 보안 모듈 정보를 기반으로 기기의 출처를 검증한다.

### authenticateDevicePair()

두 기기의 DID, credential, 정책 상태를 확인하여 기기 간 통신 또는 데이터 교환을 허용할지 결정한다.

### bindDeviceToUser()

사용자 계정, 소유권 증빙, 위임 범위를 기준으로 기기를 사용자에게 연결한다.

### bindDeviceToVehicle()

차량 식별자, 설치 위치, 센서 역할, 검증 증빙을 기준으로 기기를 차량에 연결한다.

## 6. 주요 데이터 모델

| 데이터 | 설명 |
| --- | --- |
| Device DID | 기기의 고유 식별자 |
| Device Credential | 제조, 인증, 상태 정보를 포함하는 자격 정보 |
| Device Public Key | 서명 검증에 사용하는 공개키 |
| Attestation Evidence | 출처와 무결성 증명 자료 |
| User Binding | 사용자와 기기의 관계 기록 |
| Vehicle Binding | 차량과 기기의 관계 기록 |
| Credential Status | 활성, 정지, 폐기 등 credential 상태 |

## 7. OpenEntry Platform 내 역할

Device Identity Gateway는 Device / Asset Data Layer와 Identity & Attestation Layer의 핵심 구성 요소이며, Carbon Verification Engine과 Settlement Orchestrator가 신뢰 가능한 기기 데이터를 사용할 수 있도록 한다.
