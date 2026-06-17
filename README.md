# AgentGuard Action Proxy

AgentGuard Action Proxy is a TypeScript/Fastify-based runtime governance layer for autonomous AI agents.

It verifies whether an AI agent's approved action is the same action that actually gets executed, and enforces policy, risk, approval, execution integrity, and audit evidence before external systems are called.

AgentGuard는 AI Agent가 외부 시스템/API/정산 시스템/클라우드/디바이스를 실행하기 전에 정책, 위험도, 승인 조건, 실행 무결성, 감사 증거를 검증하는 Runtime Governance Layer다.

**AgentGuard = The Harness Layer for Autonomous AI**

```text
Context = What AI knows
Harness = What AI can do
Autonomy = What AI actually does
```

This repository currently centers on the `ts-agentguard` implementation and the KGLD Vault Governance Demo.

## Why Harness Layer

AgentGuard sits between autonomous AI agents and external execution targets. Instead of allowing an agent to directly call a settlement system, API, cloud operation, or device, AgentGuard provides a governed harness that can:

- Evaluate the requested action before execution.
- Enforce policy boundaries and risk thresholds.
- Issue short-lived execution tokens only for approved actions.
- Validate that the approved action and executed action are identical.
- Produce audit evidence for decisions, execution attempts, and outcomes.
- Route approved execution toward connected systems such as a Settlement Orchestrator.

## Current Implementation

- TypeScript/Fastify runtime server
- Action preview endpoint
- Policy and risk decisioning
- Execution token issuance
- Execution integrity validation
- KGLD Vault Governance Demo UI
- Audit timeline
- Settlement Orchestrator integration path
- Strategic documentation for Context, Harness, Autonomy positioning

## Runtime Flow

```text
AI Agent Request
→ Policy Evaluation
→ Risk Evaluation
→ Decision
→ Execution Token Issuance
→ Execution Integrity Validation
→ Controlled Execution Path
→ Audit Evidence
```

## Demo

After starting the server:

```text
http://127.0.0.1:8000/demo/kgld
```

KGLD Vault Governance Demo demonstrates:

- Safe loan approval
- Margin warning
- Risk limit exceeded
- Drift attack blocking
- Unauthorized vault access blocking
- Authorized recovery
- Excessive exposure blocking
- Execution integrity validation
- Audit timeline

The KGLD Vault Governance Demo shows how AgentGuard governs AI-agent-initiated RLUSD lending against tokenized gold collateral.

The demo focuses on runtime governance patterns:

- Approved action vs executed action validation
- Policy boundary enforcement
- Risk-based decisioning
- Execution token issuance
- Settlement Orchestrator integration path
- XRPL Testnet proof display when available
- Audit evidence generation

This repository demonstrates the AgentGuard governance layer. Settlement execution and XRPL testnet proof depend on the connected Settlement Orchestrator environment and local configuration.

## Run Locally

The active implementation is TypeScript/npm-based and lives in `ts-agentguard`.

### Development server

```bash
cd ts-agentguard
npm install
npm run dev
```

### Build and start

```bash
cd ts-agentguard
npm run build
npm start
```

### Type check

```bash
cd ts-agentguard
npm run typecheck
```

### Windows CMD

```cmd
cd ts-agentguard
npm.cmd install
npm.cmd run dev
```

## API Example

Preview a KGLD/RLUSD lending action before execution:

```bash
curl -X POST http://127.0.0.1:8000/actions/preview \
  -H "Content-Type: application/json" \
  -d '{
    "action_id":"act_kgld_safe_001",
    "actor_type":"ai_agent",
    "actor_id":"agent_kgld_lending_001",
    "action_type":"BORROW_RLUSD_AGAINST_KGLD",
    "target_system":"settlement_orchestrator",
    "target_resource":"kgld:vault_gold_001",
    "parameters":{
      "collateralAmountKGLD":1000,
      "borrowAmountRLUSD":500
    },
    "context":{
      "ltv":50,
      "collateralAsset":"KGLD",
      "loanAsset":"RLUSD"
    }
  }'
```

## Decision Model

AgentGuard evaluates each action using policy and risk signals. The TypeScript implementation returns decisions such as:

- `ALLOW`: the request is within policy and risk limits.
- `REVIEW_REQUIRED`: the request needs additional review, collateral, or operator action before execution.
- `DENY` / `BLOCKED`: the request violates policy, exceeds risk limits, or fails execution-integrity validation.

Execution tokens are issued only for approved execution paths. A token does not grant broad authority; it binds a specific approved action to a controlled execution attempt.

## Security Principles

- Pre-execution policy control
- Runtime risk decisioning
- Short-lived execution token issuance
- Replay-resistant execution path
- Approved-action vs executed-action integrity validation
- Audit evidence for request, decision, token, and execution outcome
- No seed/private key/API secret should be exposed in responses, logs, or audit records

## AgentGuard Strategic Documentation

- [AgentGuard Positioning](docs/AGENTGUARD_POSITIONING.md)
- [Context Engineering](docs/CONTEXT_ENGINEERING.md)
- [Harness Engineering](docs/HARNESS_ENGINEERING.md)
- [Execution Integrity](docs/EXECUTION_INTEGRITY.md)
- [Behavior Pattern Taxonomy](docs/BEHAVIOR_PATTERN_TAXONOMY.md)
- [Policy Pattern Taxonomy](docs/POLICY_PATTERN_TAXONOMY.md)
- [Agent Reputation Engine](docs/AGENT_REPUTATION_ENGINE.md)
- [API Context Discovery Engine](docs/API-Context-Discovery-Engine.md)
- [Roadmap](docs/ROADMAP.md)

## Additional Documentation Map

### Architecture

- [Runtime Governance](docs/architecture/runtime-governance.md)
- [Policy Engine](docs/architecture/policy-engine.md)
- [Execution Flow](docs/architecture/execution-flow.md)
- [XRPL Integration](docs/architecture/xrpl-integration.md)

### Policies

- [Decision Model](docs/policies/decision-model.md)
- [Risk Scoring](docs/policies/risk-scoring.md)
- [Blocked Conditions](docs/policies/blocked-conditions.md)
- [Conditional Approval](docs/policies/conditional-approval.md)

### Security

- [Transient Token](docs/security/transient-token.md)
- [Replay Protection](docs/security/replay-protection.md)
- [Audit Model](docs/security/audit-model.md)
- [Threat Model](docs/security/threat-model.md)

### Demo / Config

- [Demo Flow](docs/demo/demo-flow.md)
- [Policy Structure](docs/configs/policy-structure.md)
- [Runtime Modes](docs/configs/runtime-modes.md)

## Legacy / Archived Notes

Earlier versions of this repository described a Python/uvicorn/pytest-centered Action Proxy. The current README intentionally prioritizes the TypeScript/Fastify implementation in `ts-agentguard`. Historical Python-oriented commands should be treated as legacy unless a separate archived workflow explicitly requires them.

## Roadmap

- API Context Discovery MVP
- GitHub Governance Demo
- AWS Governance Demo
- MCP Gateway Demo
- Agent Reputation Engine
- Behavior Pattern Engine
- Policy Adapter Framework
- Ontology and Knowledge Graph
