# Execution Flow

## End-to-End 흐름

AI Agent Request
→ DID / Agent Policy 확인
→ Risk Evaluation
→ Decision
→ Transient Token
→ Confirm Execution
→ XRPL Submit
→ TX Hash
→ Audit Receipt

## 단계 설명

1. AI Agent Request: 요청 payload 생성
2. DID / Agent Policy 확인: 주체 검증 및 권한 확인
3. Risk Evaluation: 위험 점수와 플래그 계산
4. Decision: APPROVED / CONDITIONAL_APPROVAL / BLOCKED 결정
5. Transient Token: 실행 가능 시 1회성 권한 발급
6. Confirm Execution: 조건부 승인 구간에서 사람 확인
7. XRPL Submit: 최종 트랜잭션 제출
8. TX Hash: 온체인 결과 식별자 확보
9. Audit Receipt: 실행 근거와 결과를 감사 레코드화
