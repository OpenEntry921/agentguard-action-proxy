# AgentGuard API Manual Demo

## 데모 목적

이 데모는 AgentGuard API가 다음을 end-to-end로 보여주는지 확인합니다.

- 정책 기반 차단
- 이상행위 기반 승인 요구
- 승인 후 실행 허가
- 감사 가능한 Merkle anchor

## 실행 전 준비

1. Python 3.9+ 환경 준비
2. 의존성 설치

```bash
pip install -r requirements.txt
```

3. (선택) 환경변수 파일 준비

```bash
cp .env.example .env
```

## 서버 실행 명령어

```bash
python3 -m uvicorn agentguard.api:app --reload
```

## demo client 실행 명령어

```bash
python3 examples/api_client_demo.py
```

## 단계별 예상 출력

아래는 `examples/api_client_demo.py`에서 확인하는 흐름입니다.

1) **health check**
- 호출: `GET /health`
- 예상: `{"status": "ok"}`

2) **preview**
- 호출: `POST /execution/preview`
- 예상: `decision`, `risk_score`, `risk_flags`, `request_hash` 반환

3) **approved execution**
- 호출: `POST /execution/request` (정책/리스크 통과 케이스)
- 예상: `decision=APPROVED`, `token_id` 존재, `tx_payload` 존재

4) **blocked execution**
- 호출: `POST /execution/request` (허용되지 않은 destination)
- 예상: `decision=BLOCKED`, `token_id=None`, `tx_payload=None`

5) **high-risk request**
- 호출: `POST /execution/request` (워밍업 후 고위험 요청)
- 예상: `decision=REQUIRE_APPROVAL`, `approval_id` 반환

6) **approve pending request**
- 호출: `POST /approval/{approval_id}/approve`
- 예상: `decision=APPROVED`, `token_id`/`tx_payload` 반환

7) **audit anchor**
- 호출: `GET /audit/anchor`
- 예상: `merkle_root`, `record_count`, `generated_at`, `latest_record_hash`

## 이 데모가 보여주는 가치

- **정책 기반 차단**: 규칙 위반 요청 즉시 차단
- **이상행위 기반 승인 요구**: 위험 점수 기반으로 사람 승인 전환
- **승인 후 실행 허가**: 승인 이후에만 실행 토큰/페이로드 발급
- **감사 가능한 Merkle anchor**: 실행 흔적 무결성 검증 기반 제공

## XRPL 제출 단계에 대한 현재 상태

- 현재 기본값은 `USE_XRPL_SUBMIT=false`이며, mock/payload 중심 데모입니다.
- 실제 XRPL testnet submit은 다음 단계에서 시드/issuer 설정 후 활성화합니다.
