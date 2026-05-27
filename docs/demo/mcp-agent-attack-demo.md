# MCP 악성 AI-Agent 공격 시뮬레이션 데모 (Safe Mock Simulation)

이 문서는 **실제 공격 도구가 아닌 safe mock simulation**을 설명합니다.

- 실제 공격 코드 없음
- 실제 GitHub token/API key 읽기 없음
- 실제 외부 전송 없음
- 실제 GitHub/GitHub Actions API 호출 없음
- 모든 요청은 AgentGuard 로컬 API를 대상으로 하는 시뮬레이션 payload

## 왜 필요한가: MCP / Tool Poisoning / Indirect Prompt Injection

MCP(Model Context Protocol) 기반 도구 연결 환경에서는, AI Agent가 외부 도구 응답을 신뢰해 위험한 액션을 생성할 수 있습니다.

- **Tool Poisoning**: 오염된 도구 응답이 에이전트를 잘못 유도
- **Indirect Prompt Injection**: 문서/도구 출력 내 숨겨진 지시가 에이전트 행동을 변질
- **결과**: 권한은 정상이어도, 실행하려는 action 자체가 고위험이 될 수 있음

AgentGuard는 이 action을 `/actions/preview` 단계에서 실행 전에 가로채고 정책 + 리스크로 통제합니다.

## 4대 시나리오

1. **GitHub Token Theft Attempt**
   - action_type: `github.read_token_attempt`
   - target_resource: `process.env.GITHUB_TOKEN`

2. **CI/CD Workflow Tampering**
   - action_type: `github.modify_ci_workflow`
   - target_resource: `.github/workflows/deploy.yml`

3. **API Key Exfiltration**
   - action_type: `github.export_secrets`
   - target_resource: `.env.production`

4. **Automation Abuse**
   - action_type: `automation.mass_action_abuse`
   - target_resource: `organization/repos/*`

## 실행 방법

1) AgentGuard 서버 실행

```bash
python -m uvicorn agentguard.api:app --reload
```

2) 시뮬레이터 실행

```bash
python examples/mcp_malicious_agent.py --scenario all
```

개별 실행:

```bash
python examples/mcp_malicious_agent.py --scenario token_theft
python examples/mcp_malicious_agent.py --scenario cicd_attack
python examples/mcp_malicious_agent.py --scenario api_key_leak
python examples/mcp_malicious_agent.py --scenario automation_abuse
```

> 기본 동작은 preview-only 입니다. (`/actions/execute` 미호출)

## 예상 결과

- `token_theft`: `DENY`
- `cicd_attack`: `REVIEW_REQUIRED` 또는 `DENY`
- `api_key_leak`: `DENY`
- `automation_abuse`: `REVIEW_REQUIRED`

## 핵심 메시지

> MCP와 AI Agent 시대에는 도구 접근 권한만으로는 부족하다.  
> AgentGuard는 AI Agent가 실제 실행하려는 고위험 action을 실행 전에 통제한다.
