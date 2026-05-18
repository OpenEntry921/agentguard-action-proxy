# AgentGuard API curl Examples

기본 주소:

```bash
BASE_URL="http://127.0.0.1:8000"
```

## 1) GET /health

### curl
```bash
curl -sS "$BASE_URL/health"
```

### 요청 JSON
없음

### 예상 응답 예시
```json
{
  "status": "ok"
}
```

---

## 2) POST /execution/preview

### curl
```bash
curl -sS -X POST "$BASE_URL/execution/preview" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "did:openentry:agent:manual",
    "wallet_address": "rWalletManual",
    "action": "pay",
    "amount": 20,
    "currency": "RLUSD",
    "destination": "rDest1",
    "purpose": "ops",
    "context": {"source": "manual-curl"}
  }'
```

### 요청 JSON
```json
{
  "agent_id": "did:openentry:agent:manual",
  "wallet_address": "rWalletManual",
  "action": "pay",
  "amount": 20,
  "currency": "RLUSD",
  "destination": "rDest1",
  "purpose": "ops",
  "context": {"source": "manual-curl"}
}
```

### 예상 응답 예시
```json
{
  "decision": "APPROVED",
  "reason": null,
  "risk_score": 0,
  "risk_flags": [],
  "request_hash": "<request_hash>"
}
```

---

## 3) POST /execution/request (정상 승인)

### curl
```bash
curl -sS -X POST "$BASE_URL/execution/request" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "did:openentry:agent:manual",
    "wallet_address": "rWalletManual",
    "action": "pay",
    "amount": 20,
    "currency": "RLUSD",
    "destination": "rDest1",
    "purpose": "ops",
    "context": {"source": "manual-curl"}
  }'
```

### 요청 JSON
(위 preview와 동일)

### 예상 응답 예시
```json
{
  "decision": "APPROVED",
  "reason": null,
  "token_id": "<token_id>",
  "tx_payload": {"TransactionType": "Payment", "Memos": [{"Memo": {"MemoData": "..."}}]},
  "approval_id": null,
  "request_hash": "<request_hash>",
  "audit_record_hash": "<audit_record_hash>"
}
```

---

## 4) POST /execution/request (차단 케이스)

### curl
```bash
curl -sS -X POST "$BASE_URL/execution/request" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "did:openentry:agent:manual",
    "wallet_address": "rWalletManual",
    "action": "pay",
    "amount": 20,
    "currency": "RLUSD",
    "destination": "rBlocked",
    "purpose": "ops",
    "context": {"source": "manual-curl"}
  }'
```

### 요청 JSON
```json
{
  "agent_id": "did:openentry:agent:manual",
  "wallet_address": "rWalletManual",
  "action": "pay",
  "amount": 20,
  "currency": "RLUSD",
  "destination": "rBlocked",
  "purpose": "ops",
  "context": {"source": "manual-curl"}
}
```

### 예상 응답 예시
```json
{
  "decision": "BLOCKED",
  "reason": "DESTINATION_NOT_ALLOWED",
  "token_id": null,
  "tx_payload": null,
  "approval_id": null,
  "request_hash": "<request_hash>",
  "audit_record_hash": "<audit_record_hash>"
}
```

---

## 5) POST /execution/request (REQUIRE_APPROVAL 케이스)

> 참고: 기본 정책에서 반복 트랜잭션 후 고위험 요청으로 분류되면 `REQUIRE_APPROVAL`이 반환됩니다.

### Step A. 트래픽 워밍업(예시)
```bash
for i in {1..8}; do
  curl -sS -X POST "$BASE_URL/execution/request" \
    -H "Content-Type: application/json" \
    -d '{
      "agent_id": "did:openentry:agent:manual",
      "wallet_address": "rWalletManual",
      "action": "pay",
      "amount": 10,
      "currency": "RLUSD",
      "destination": "rDest1",
      "purpose": "ops",
      "context": {"source": "manual-curl"}
    }' > /dev/null
 done
```

### Step B. 고위험 요청
```bash
curl -sS -X POST "$BASE_URL/execution/request" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "did:openentry:agent:manual",
    "wallet_address": "rWalletManual",
    "action": "pay",
    "amount": 40,
    "currency": "RLUSD",
    "destination": "rDest2",
    "purpose": "ops",
    "context": {"source": "manual-curl-high-risk"}
  }'
```

### 요청 JSON
```json
{
  "agent_id": "did:openentry:agent:manual",
  "wallet_address": "rWalletManual",
  "action": "pay",
  "amount": 40,
  "currency": "RLUSD",
  "destination": "rDest2",
  "purpose": "ops",
  "context": {"source": "manual-curl-high-risk"}
}
```

### 예상 응답 예시
```json
{
  "decision": "REQUIRE_APPROVAL",
  "reason": "HIGH_RISK_REQUIRES_APPROVAL",
  "token_id": null,
  "tx_payload": null,
  "approval_id": "<approval_id>",
  "request_hash": "<request_hash>",
  "audit_record_hash": "<audit_record_hash>"
}
```

---

## 6) POST /approval/{approval_id}/approve

### curl
```bash
APPROVAL_ID="<approval_id-from-require-approval-response>"
curl -sS -X POST "$BASE_URL/approval/$APPROVAL_ID/approve"
```

### 요청 JSON
없음

### 예상 응답 예시
```json
{
  "decision": "APPROVED",
  "reason": null,
  "token_id": "<token_id>",
  "tx_payload": {"TransactionType": "Payment", "Memos": [{"Memo": {"MemoData": "..."}}]},
  "audit_record_hash": "<audit_record_hash>"
}
```

---

## 7) POST /approval/{approval_id}/reject

### curl
```bash
APPROVAL_ID="<approval_id-from-require-approval-response>"
curl -sS -X POST "$BASE_URL/approval/$APPROVAL_ID/reject"
```

### 요청 JSON
없음

### 예상 응답 예시
```json
{
  "decision": "REJECTED",
  "reason": "REJECTED_BY_ADMIN",
  "token_id": null,
  "tx_payload": null,
  "audit_record_hash": "<audit_record_hash>"
}
```

---

## 8) GET /audit/anchor

### curl
```bash
curl -sS "$BASE_URL/audit/anchor"
```

### 요청 JSON
없음

### 예상 응답 예시
```json
{
  "merkle_root": "<merkle_root>",
  "record_count": 12,
  "generated_at": 1760000000,
  "latest_record_hash": "<latest_record_hash>"
}
```

---

## 9) GET /audit/record/{record_hash}

### curl
```bash
RECORD_HASH="<audit_record_hash>"
curl -sS "$BASE_URL/audit/record/$RECORD_HASH"
```

### 요청 JSON
없음

### 예상 응답 예시
```json
{
  "record_hash": "<record_hash>",
  "agent_id": "did:openentry:agent:manual",
  "decision": "APPROVED",
  "request_hash": "<request_hash>",
  "risk_score": 0,
  "risk_flags": []
}
```

---

## 10) GET /audit/request/{request_hash}

### curl
```bash
REQUEST_HASH="<request_hash>"
curl -sS "$BASE_URL/audit/request/$REQUEST_HASH"
```

### 요청 JSON
없음

### 예상 응답 예시
```json
[
  {
    "record_hash": "<record_hash>",
    "request_hash": "<request_hash>",
    "decision": "APPROVED"
  }
]
```
