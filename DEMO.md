# AgentGuard Action Proxy API Manual Demo

## 데모 목적

이 데모는 AgentGuard API가 AI Agent의 action request를 end-to-end로 통제하는지 확인한다.

- 정책 기반 차단
- 위험 점수 기반 조건부 승인
- 승인 후 controlled execution 허가
- 감사 가능한 request/decision/result 기록

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

아래는 `examples/api_client_demo.py`에서 확인하는 흐름이다.

1) **health check**
- 호출: `GET /health`
- 예상: `{"status": "ok"}`

2) **preview**
- 호출: `POST /execution/preview`
- 예상: `decision`, `risk_score`, `risk_flags`, `request_hash` 반환

3) **approved execution**
- 호출: `POST /execution/request` (정책/리스크 통과 케이스)
- 예상: `decision=APPROVED`, `token_id` 존재, 실행 payload 또는 controlled execution 결과 존재

4) **blocked execution**
- 호출: `POST /execution/request` (허용되지 않은 destination/action)
- 예상: `decision=BLOCKED`, `token_id=None`, 실행 payload/result 없음

5) **high-risk request**
- 호출: `POST /execution/request` (워밍업 후 고위험 요청)
- 예상: 조건부 승인 상태와 `approval_id` 반환

6) **approve pending request**
- 호출: `POST /approval/{approval_id}/approve`
- 예상: 승인 후 `token_id`와 실행 payload/result 반환

7) **audit anchor / receipt**
- 호출: `GET /audit/anchor`
- 예상: `merkle_root`, `record_count`, `generated_at`, `latest_record_hash`

## 이 데모가 보여주는 가치

- **정책 기반 차단**: 규칙 위반 요청 즉시 차단
- **위험 기반 승인 요구**: 위험 점수 기반으로 사람 승인 전환
- **승인 후 실행 허가**: 승인 이후에만 실행 토큰/페이로드 발급
- **감사 가능한 실행 거버넌스**: 요청, 판단, 실행 결과를 연결하는 감사 근거 제공

## XRPL 제출 단계에 대한 현재 상태

- XRPL은 현재 데모에서 사용할 수 있는 controlled execution target 중 하나다.
- 기본값은 `USE_XRPL_SUBMIT=false`이며, mock/payload 중심 데모다.
- 실제 XRPL testnet submit은 명시적인 seed/issuer 설정 후 활성화한다.
