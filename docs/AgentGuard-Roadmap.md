# AgentGuard Roadmap

## 1. 문서 목적

본 문서는 AgentGuard가 OpenEntry Platform의 거버넌스 레이어로 발전하기 위한 로드맵을 정의한다.

AgentGuard는 단순한 Action Taxonomy가 아니라 Behavior Pattern Taxonomy를 중심으로 발전한다.

## 2. 현재 상태

AgentGuard의 현재 핵심 구성 요소는 다음과 같다.

```text
Policy Engine
Risk Engine
Execution Token
Drift Detection
Audit Engine
```

## 3. 현재 구성 요소 정의

### Policy Engine

실행 요청이 조직 정책, 사용자 권한, 리소스 범위, 목적에 부합하는지 판단한다.

### Risk Engine

요청 context, 대상 리소스, 과거 이력, 데이터 민감도, 정책 위반 가능성을 기반으로 위험 점수를 계산한다.

### Execution Token

허용된 실행에 대해 제한된 범위와 수명을 가진 실행 토큰을 발급한다.

### Drift Detection

Agent 행동이 기존 정상 패턴에서 벗어나는지 탐지한다.

### Audit Engine

정책 판단, 위험 점수, 실행 결과, 예외 상황을 감사 가능한 증적으로 기록한다.

## 4. 향후 발전 방향

```text
Agent History
Agent Reputation
Behavior Store
Pattern Taxonomy
Ontology
Knowledge Graph
Intent Analysis
```

### Agent History

Agent별 실행 이력, 요청 context, 실패 및 거부 이력을 장기적으로 관리한다.

### Agent Reputation

Agent의 과거 행동, 정책 준수율, 위험 누적도, 정상 패턴 일치도를 기반으로 신뢰도를 산정한다.

### Behavior Store

Agent 행동 패턴, sequence, intent, drift event, audit evidence를 저장하는 행동 데이터 저장소이다.

### Pattern Taxonomy

정상 행동과 위험 행동을 분류하는 체계이다. 단일 action 명칭이 아니라 반복, 축적, 우회, 노출 확대 등 행위 패턴을 중심으로 구성한다.

### Ontology

Agent, action, resource, intent, policy, risk, evidence 간 관계를 의미론적으로 정의한다.

### Knowledge Graph

Agent 행동, 리소스 접근, 정책 판단, 위험 이벤트의 관계를 graph 구조로 표현한다.

### Intent Analysis

표면적인 action이 아니라 실행 의도와 context를 분석하여 위험도를 판단한다.

## 5. 핵심 철학: Behavior Pattern Taxonomy

AgentGuard는 Action Taxonomy 중심의 단순 분류에서 벗어나 Behavior Pattern Taxonomy를 중심으로 발전한다.

Action Taxonomy는 `read`, `write`, `delete`, `transfer`와 같은 개별 행위를 분류하는 데 유용하지만, 실제 위험은 반복, 축적, 우회, 조합, context 변화에서 발생한다.

Behavior Pattern Taxonomy는 Agent가 어떤 패턴으로 행동하는지, 그 패턴이 어떤 위험 신호를 만드는지, 그리고 어떤 정책 개입이 필요한지를 설명한다.

## 6. 주요 Behavior Pattern 예시

### Drift Pattern

기존 정상 행동 범위에서 벗어나는 요청 빈도, 리소스 유형, 데이터 범위, 실행 목적의 변화이다.

### Unauthorized Access Pattern

권한이 없거나 목적에 맞지 않는 리소스에 접근하려는 반복적 시도이다.

### Accumulation Pattern

개별 요청은 낮은 위험으로 보이지만, 누적 시 민감 정보나 자산 통제권을 과도하게 확보하는 패턴이다.

### Exposure Escalation Pattern

처음에는 제한된 데이터 접근으로 시작했으나 점차 더 넓은 범위의 외부 노출로 이어지는 패턴이다.

### Bypass Pattern

정책, rate limit, 승인 절차, credential 제한을 우회하려는 시도이다.

### Reconnaissance Pattern

실제 실행보다 시스템 구조, 권한 범위, 데이터 위치, API 한계를 탐색하는 행동 패턴이다.

## 7. OpenEntry Platform 내 역할

AgentGuard는 OpenEntry Platform의 Governance Layer로서 Device Identity, Carbon Verification, Assetization, Settlement 요청을 정책과 위험 기준으로 통제한다.

## 8. 로드맵 단계

| 단계 | 목표 | 주요 산출물 |
| --- | --- | --- |
| Phase 1 | 현재 기능 안정화 | Policy, Risk, Execution Token, Audit 기준 정리 |
| Phase 2 | Behavior Pattern 정의 | Drift, Bypass, Accumulation 등 taxonomy 문서화 |
| Phase 3 | Agent History 구축 | Agent별 실행 이력과 audit evidence 체계화 |
| Phase 4 | Reputation 및 Knowledge Graph | 신뢰도 산정과 관계 기반 위험 분석 |
| Phase 5 | Intent Analysis | context 기반 의도 분석과 고급 정책 판단 |
