# Context Engineering

## Definition

**Context Engineering is the process of discovering, modeling, and structuring the information, policies, processes, APIs, risks, and organizational knowledge that AI agents need in order to make decisions.**

Context Engineering은 기업 내부의 정책, API, 업무 프로세스, 권한 구조, 데이터, 리스크 기준, 암묵지를 AI가 이해하고 활용할 수 있는 구조로 정리하는 작업이다.

## Why Context Engineering Matters Before AgentGuard

AI agents cannot be governed reliably if the enterprise does not understand what the agent may know, which systems it can reach, which actions are sensitive, and which business rules apply.

Context Engineering prepares that knowledge before it enters the Harness Layer. It turns scattered organizational information into structured context that can be mapped into governance controls.

## Core Components

- **Policy Discovery**: Identify formal and informal policies that govern actions, assets, approvals, and exceptions.
- **API Discovery**: Find system interfaces that expose executable business actions.
- **Business Process Mapping**: Model workflows, approval chains, operational dependencies, and handoff points.
- **Risk Context Mapping**: Connect actions and resources to financial, operational, security, privacy, compliance, or safety risks.
- **Permission Context Mapping**: Map roles, scopes, identities, credentials, and delegated authority.
- **Ontology Design**: Define canonical concepts such as action, resource, actor, permission, risk, policy, evidence, and target system.
- **Knowledge Graph Preparation**: Prepare relationships among systems, users, APIs, assets, actions, and risks.
- **Context Map Generation**: Produce structured artifacts that can be reviewed by humans and attached to AgentGuard.

## Relationship to API Context Discovery

**API is the living action dictionary of modern enterprise systems.**

API는 현대 기업 시스템의 살아있는 행동 사전이다. API를 분석하면 AI Agent가 어떤 행동을 할 수 있는지, 어떤 자산에 접근하는지, 어떤 위험이 있는지 추론할 수 있다.

```text
API Discovery
↓
Context Discovery
↓
Action / Resource / Risk / Permission extraction
↓
AgentGuard Policy Adapter connection
```

API Context Discovery is one module of Context Engineering. It focuses on executable interfaces and extracts candidate action, resource, risk, and permission models.

## Consulting and Policy Engineering Role

Context Engineering can be performed by security consulting firms, governance specialists, or Policy Engineering companies.

OpenEntry can receive this context and enforce runtime controls through AgentGuard as the Harness Layer. In this model:

- Consultants and customers discover and structure context.
- Customers own final policies and governance intent.
- AgentGuard enforces approved policy at runtime.
