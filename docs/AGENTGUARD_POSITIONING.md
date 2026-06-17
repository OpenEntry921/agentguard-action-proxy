# AgentGuard Positioning

## Core Definition

**AgentGuard is the Harness Layer for Autonomous AI.**

AgentGuard는 AI Agent가 Context를 기반으로 Autonomy를 실행하기 전에, 정책, 위험, 권한, 승인, 실행 무결성 기준으로 행동을 통제하는 독립 Governance Runtime이다.

AgentGuard sits between what an AI system knows and what an AI system does. It defines the action boundary, evaluates the runtime request, verifies execution integrity, and records evidence for governance.

## The Three-Layer Model

```text
Context = What AI knows
Harness = What AI can do
Autonomy = What AI actually does
```

### Context

Context is the structured knowledge that helps an AI agent reason: policies, APIs, business processes, permissions, organizational knowledge, risk criteria, and operational state.

### Harness

Harness is the runtime control layer that determines which actions are allowed, which actions require review, which actions must be blocked, and what evidence must be retained.

### Autonomy

Autonomy is the actual execution behavior of the AI agent: calling APIs, changing systems, moving assets, creating pull requests, modifying cloud resources, or operating devices.

## AgentGuard's Role

AgentGuard defines behavioral boundaries between Context and Autonomy and ensures that only approved actions are executed.

It does not replace the agent's intelligence. It does not replace the enterprise's policy ownership. Instead, it provides an independent governance runtime that evaluates and constrains agent actions before and during execution.

## Execution Integrity Statement

**AgentGuard ensures that the action approved for an AI agent is the same action that actually gets executed.**

This is the central difference between simple approval workflows and runtime governance. Approval is not enough if the executed action can drift from the approved action. AgentGuard treats this approval-to-execution consistency as a first-class governance requirement.

## What AgentGuard Is Not

- AgentGuard is not a generic AI Safety product.
- AgentGuard is not only prompt security.
- AgentGuard is not only IAM/SSO.
- AgentGuard is not only blockchain settlement.

These categories may be adjacent to AgentGuard, but they do not define its core position.

## What AgentGuard Is

AgentGuard should be positioned as:

- AI Agent Runtime Governance
- AI Action Control Layer
- Policy-Agnostic Governance Runtime
- Execution Integrity Layer
- Harness Layer for Autonomous AI

## Strategic Summary

AgentGuard converts customer-owned context and policy into runtime action control. It governs what autonomous AI agents can do, under what conditions, with which approvals, and with what evidence.
