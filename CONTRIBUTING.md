# 기여 가이드 (Contributing)

AgentGuard MVP에 관심을 가져주셔서 감사합니다.

이 저장소는 AI Agent 행위 통제 레이어에 대한 PoC입니다. 기여 시 아래 3가지 원칙을 우선으로 유지해 주세요.

1. **액션 단위 통제(Action-level control)**
   - 단순 인증(Authentication) 중심 기능 확장은 지양하고, 액션 단위 인가/통제 강화에 기여하는 변경을 우선합니다.

2. **시크릿 최소화(Secret minimization)**
   - AI Agent가 실제 API key나 장기 비밀키를 직접 받지 않도록 설계 원칙을 유지합니다.

3. **검증 가능한 책임성(Verifiable accountability)**
   - 중요한 행위는 감사 가능해야 하며, 향후 앵커링 가능한 증적 형태를 지향합니다.

## 개발 환경 설정

```bash
python -m venv .venv
source .venv/bin/activate
make install
make test
```

## Pull Request 규칙

PR 제출 전 아래를 확인해 주세요.

- 테스트를 추가하거나 기존 테스트를 갱신합니다.
- 외부 유료 서비스 없이 예제가 실행 가능하도록 유지합니다.
- 실제 secret, API key, wallet seed, private key는 절대 커밋하지 않습니다.
- 데이터 흐름이 변경되면 `docs/architecture.md`를 업데이트합니다.
- 보안 경계가 변경되면 `docs/threat_model.md`를 업데이트합니다.

## 코드 스타일

MVP 단계에서는 의존성을 최소화합니다.

프레임워크 중심의 복잡한 구조보다, 읽기 쉽고 명확한 Python 코드를 선호합니다.

## 보안 민감 변경

아래 영역을 수정할 때는 테스트와 함께 보안 영향 설명을 짧게 포함해 주세요.

- token issuance
- signature verification
- replay prevention
- audit logging
- anchoring
