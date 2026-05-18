# 보안 정책 (Security Policy)

## 프로젝트 상태

AgentGuard Action Proxy MVP는 개념검증(Proof-of-Concept) 단계이며, **운영(Production) 준비가 완료된 상태가 아닙니다.**

실결제, 실제 API key, 실제 지갑, 규제 대상 금융 시스템 보호 용도로 사용하기 전에는 반드시 별도의 보안 검토를 수행해야 합니다.

## 지원 버전

현재는 최신 `main` 브랜치만 유지/관리합니다.

## 보안 취약점 제보 방법

보안 이슈는 공개 Issue로 등록하지 마세요.

아래 연락처로 비공개 제보해 주세요.

```text
security@example.com
```

배포 전에는 반드시 실제 운영 보안 연락처로 교체해야 합니다.

제보 시 포함 권장 항목:

- 취약점 요약 및 영향 범위
- 재현 절차(가능한 최소 단계)
- 예상되는 공격 시나리오
- 임시 완화 방법(있다면)

## 민감 정보 관리 원칙

다음 값은 **절대 저장소에 커밋하면 안 됩니다.**

- seed (예: XRPL wallet seed)
- private key
- API key
- production credentials
- 고객/규제 데이터

원칙:

- 로컬 테스트는 테스트넷 또는 mock 자격증명만 사용
- `.env` 파일은 Git 추적 제외 유지
- 로그/스크린샷/PR 본문에 민감값 마스킹
- AI Agent에게 장기 실행 secret을 직접 노출하지 않음

## 보안 경계 (Security Boundaries)

AgentGuard MVP는 아래 방식으로 피해 반경(blast radius) 축소를 목표로 합니다.

- 액션 단위 정책 검증 강제
- 위험 점수 기반 조건부 승인
- 1회성 Action Token 발급
- 토큰 재사용(replay) 방지
- 실제 API key 또는 signer secret을 프록시 뒤에 격리
- 검증 가능한 감사 receipt 생성

## 알려진 한계 (Known Limitations)

현재 MVP는 아래 항목을 아직 제공하지 않습니다.

- HSM/KMS 기반 서명키 운용
- 운영 등급 시크릿 저장소
- 분산 환경 replay 방지
- 실제 OPA/Rego 또는 Cedar 정책 실행
- 모든 execution target에 대한 실거래 제출 보장
- 형식 검증(formal verification)
- 공식 보안 감사(formal security audit)
- 정교한 rate limiting / anomaly detection
- 멀티테넌트 격리

## DID / XRPL Trust Adapter 상태

DID와 XRPL은 AgentGuard의 core security boundary가 아니라 선택적 trust/execution adapter입니다. 현재 DID resolver는 production-grade 신원검증 체계로 간주하면 안 되며, XRPL submit은 명시적으로 활성화한 경우에만 controlled execution target으로 사용해야 합니다.
