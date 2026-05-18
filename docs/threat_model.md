# 위협 모델 (Threat Model)

## 보안 목표 (Security Goal)

AgentGuard는 “AI Agent 관련 모든 리스크를 제거한다”고 주장하지 않습니다.

보다 현실적인 목표는 아래와 같습니다.

> Agent 또는 자격증명이 침해되더라도, AI Agent가 할 수 있는 행동 범위를 정책으로 제한한다.

## 완화 가능한 위협 (Threats Mitigated)

### 1. Agent 권한 탈취 (Agent takeover)
AI Agent가 침해되어도 정책 밖 액션은 실행할 수 없습니다.

### 2. Agent로의 API Key 노출
Agent는 실제 API key를 받지 않습니다.  
실제 외부 API 호출은 Execution Proxy가 담당합니다.

### 3. 과도한 지출/행위 범위 확장
정책 검증으로 금액, 가맹점, 목적, 액션 경계를 강제합니다.

### 4. 재사용 공격 (Replay attack)
Action Token은 고유 `jti`를 포함하며 1회만 소비됩니다.

### 5. 로그 변조 (Log tampering)
원본 로그를 Merkle Root로 요약하고,  
해당 루트를 외부 ledger나 감사 저장소에 앵커링하면 사후 변조를 탐지할 수 있습니다.

## 아직 완전 대응되지 않은 위협 (Threats Not Fully Mitigated)

### 1. 잘못 설계된 정책
정책 자체가 과도하거나 잘못되면, 시스템은 잘못된 경계를 그대로 강제합니다.

### 2. Gateway 개인키 유출
Gateway 서명키가 유출되면 공격자가 유효해 보이는 토큰을 발급할 수 있습니다.  
운영 환경에서는 HSM/KMS 및 키 로테이션이 필수입니다.

### 3. 외부 API/인프라 침해
Stripe, ERP, SaaS, 은행 API 자체가 침해되면 AgentGuard만으로는 하류 피해를 완전히 차단할 수 없습니다.

### 4. 악의적 정상 사용자
정상 권한 사용자가 의도적으로 위험 권한을 위임하면, AgentGuard는 기록/제한은 가능하지만 의도를 완벽히 판별하진 못합니다.

### 5. 정책 검증 이전의 프롬프트 인젝션
정책 검증은 피해 반경을 줄여주지만, 프롬프트 인젝션 방어는 별도의 LLM/툴링 보안장치가 필요합니다.

## 운영 전환 체크리스트 (Production Hardening Checklist)

- Replace JSON policy with OPA/Rego or Cedar
- Store token state in Redis/PostgreSQL
- Integrate Vault / AWS Secrets Manager / GCP Secret Manager
- Use HSM/KMS for gateway signing keys
- Add rate limits and anomaly detection
- Add user MFA or push approval for high-risk actions
- Optionally anchor Merkle Roots to XRPL testnet/mainnet or another integrity backend
