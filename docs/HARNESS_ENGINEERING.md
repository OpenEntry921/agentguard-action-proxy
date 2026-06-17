# Harness Engineering

## Definition

**Harness Engineering is the design of the control layer that defines and enforces what AI agents are allowed to do, under what conditions, and with what evidence.**

Harness Engineering은 AI Agent가 어떤 행동을 할 수 있고, 어떤 조건에서 허용되며, 어떤 증거를 남겨야 하는지를 설계하고 강제하는 통제 계층을 만드는 작업이다.

## AgentGuard as the Harness Layer

AgentGuard is the Harness Layer for Autonomous AI. It transforms customer-owned context and policy into runtime governance decisions for autonomous actions.

## Harness Components

AgentGuard's Harness consists of:

- **Policy Adapter**: Converts customer-approved policies and context artifacts into AgentGuard-compatible runtime controls.
- **Policy Runtime**: Evaluates requests against policy, permissions, thresholds, approvals, and exceptions.
- **Risk Engine**: Scores action risk based on target, parameters, history, sensitivity, and context.
- **Execution Integrity Engine**: Verifies that the executed action matches the approved action.
- **Behavior Pattern Engine**: Detects risky patterns across sequences of actions rather than isolated requests only.
- **Agent Reputation Engine**: Incorporates agent behavior history into runtime risk evaluation.
- **Evidence & Audit Engine**: Produces durable evidence for decision, approval, execution, and integrity checks.

## Core Runtime Structure

```text
Customer-Owned Policy
↓
Policy Adapter
↓
AgentGuard Runtime
↓
Execution Integrity Check
↓
Behavior Pattern Detection
↓
Evidence & Audit
```

## Key Philosophy

**AgentGuard does not own the customer's policy.**

**AgentGuard enforces the customer's policy at runtime.**

This distinction matters because AgentGuard is policy-agnostic. It can enforce financial controls, GitHub controls, cloud controls, device controls, or enterprise workflow controls without claiming ownership of the policy itself.

## Harness Engineering Output

A mature Harness Engineering process should produce:

- Runtime policy mappings.
- Action and resource boundaries.
- Approval requirements.
- Risk scoring inputs.
- Execution integrity fingerprints.
- Evidence requirements.
- Review and escalation paths.
