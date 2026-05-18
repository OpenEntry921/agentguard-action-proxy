# XRPL 연동 계획 (XRPL Integration Plan)

## 포지셔닝

XRPL은 AgentGuard Action Proxy가 통제할 수 있는 실행 대상이자 감사 앵커 후보 중 하나다. 이 문서는 XRPL 중심 제품 설명이 아니라, AI Runtime Execution Governance가 XRPL 실행을 어떻게 사전 통제하는지 설명한다.

## 1. XRPL 실행 대상

AgentGuard는 XRPL 실행 전에 다음을 강제한다.

- policy evaluation
- risk scoring
- blocked condition check
- conditional approval
- transient execution token
- audit receipt generation

승인된 요청만 XRPL submit 경로로 이동할 수 있다.

## 2. XRPL DID의 선택적 역할

XRPL DID는 아래 주체의 신뢰 기준점으로 사용할 수 있다.

- Organization DID
- AI Agent DID
- Gateway DID

다만 DID는 AgentGuard의 필수 runtime dependency가 아니다. DID를 사용하더라도 최종 실행 허용 여부는 policy/risk decision이 결정한다.

## 3. 감사 앵커링 (Audit Anchoring)

AgentGuard는 원본 로그를 온체인에 직접 저장하지 않는다. 대신 감사 레코드의 요약값을 외부 앵커로 남길 수 있다.

```text
Runtime audit records off-chain
   ↓
Merkle Root or equivalent digest
   ↓
Optional XRPL Memo Anchor
```

## 4. Memo 전략 (Memo Strategy)

감사 앵커 메모는 다음 구조를 따를 수 있다.

```json
{
  "protocol": "agentguard",
  "version": "0.2",
  "type": "audit_anchor",
  "anchor": {
    "record_count": 2,
    "merkle_root": "...",
    "created_at": 1234567890
  }
}
```

## 5. 안전한 데모 모드 (Safe Demo Modes)

모든 XRPL 데모는 기본적으로 dry-run 또는 mock 중심으로 이해해야 한다.

XRPL 테스트넷으로 실제 제출하려면 환경변수를 명시적으로 설정한다.

```bash
export XRPL_TESTNET_SEED="sn..."
export XRPL_ACCOUNT="r..."
export XRPL_ANCHOR_DESTINATION="r..."
export USE_XRPL_SUBMIT="true"
export XRPL_TESTNET_URL="https://s.altnet.rippletest.net:51234"
```

## 6. 현재 한계 (Current Limits)

- DID resolver는 production-grade trust adapter가 아니다.
- DIDSet 실거래 제출은 대상 네트워크의 DID amendment 지원이 필요하다.
- 감사 앵커링은 optional integrity anchor다.
- 원본 로그는 오프체인에 유지된다.
- XRPL 통합은 AgentGuard의 core runtime governance를 보여주는 하나의 adapter다.
