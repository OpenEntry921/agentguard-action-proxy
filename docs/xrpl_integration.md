# XRPL 연동 계획 (XRPL Integration Plan)

## 1. XRPL DID

AgentGuard는 아래 주체의 신뢰 기준점으로 XRPL DID를 사용합니다.

- Organization DID
- AI Agent DID
- Gateway DID

XRPL DID는 `DIDSet` 트랜잭션으로 생성/수정합니다.

DIDSet 트랜잭션에는 최소 1개 이상의 필드가 필요합니다.

- `Data`
- `DIDDocument`
- `URI`

## 2. 감사 앵커링 (Audit Anchoring)

AgentGuard는 원본 로그를 온체인에 직접 저장하지 않습니다.

대신 아래 방식으로 요약 앵커를 남깁니다.

```text
Raw logs off-chain
   ↓
Merkle Root
   ↓
XRPL Memo Anchor
```

## 3. Memo 전략 (Memo Strategy)

감사 앵커 메모는 다음 구조를 따릅니다.

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

## 4. 안전한 데모 모드 (Safe Demo Modes)

모든 XRPL 데모는 기본적으로 dry-run 모드입니다.

XRPL 테스트넷으로 실제 제출하려면 아래를 설정하세요.

```bash
export XRPL_TESTNET_SEED="sn..."
export XRPL_ACCOUNT="r..."
export XRPL_ANCHOR_DESTINATION="r..."
```

AgentGuard 게이트웨이 실행 경로까지 포함하려면 아래도 설정합니다.

```bash
export USE_XRPL_SUBMIT="true"
export XRPL_TESTNET_URL="https://s.altnet.rippletest.net:51234"  # optional
```

그 다음 실행:

```bash
python examples/xrpl_didset_demo.py
python examples/xrpl_live_anchor_demo.py
```

## 5. 현재 한계 (Current Limits)

- DID resolver는 아직 stub 단계입니다.
- DIDSet 실거래 제출은 대상 네트워크의 DID amendment 지원이 필요합니다.
- 감사 앵커링은 Payment Memo 패턴을 사용합니다.
- 원본 로그는 오프체인에 유지됩니다.
