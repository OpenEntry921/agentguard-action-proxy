# Agent Reputation Engine

## Core Concept

**Agent behavior history becomes part of runtime risk evaluation.**

The Agent Reputation Engine evaluates an AI agent's historical behavior and uses that history to influence future governance decisions.

## Why Reputation Matters

Two agents can submit the same action request but represent different risk levels. An agent with a long history of successful, policy-compliant execution may be treated differently from an agent with repeated drift attempts, blocked actions, or unauthorized target access.

## Tracked Signals

AgentGuard should track:

- Successful Executions
- Blocked Actions
- Review Required Actions
- Drift Attempts
- Unauthorized Access Attempts
- Policy Violations
- Risk Score Trend
- Target Systems Accessed
- Sensitive Actions Attempted

## Example Reputation Record

```json
{
  "agentId": "agent_001",
  "successfulExecutions": 37,
  "blockedActions": 4,
  "driftAttempts": 2,
  "unauthorizedAccessAttempts": 1,
  "reputationScore": 82,
  "riskTrend": "increasing"
}
```

## Runtime Use

AgentGuard can process the same request differently depending on Agent Reputation:

```text
High reputation agent → ALLOW
Medium reputation agent → REVIEW
Low reputation or repeated violation agent → BLOCK
```

## Reputation Inputs and Outputs

### Inputs

- Execution outcomes.
- Integrity comparison results.
- Policy violations.
- Manual review decisions.
- Target system sensitivity.
- Behavior pattern detections.

### Outputs

- Reputation score.
- Risk trend.
- Behavior summary.
- Recommended governance response.
- Reviewer context for manual approval.

## Governance Principles

- Reputation should support governance decisions, not replace policy.
- Sensitive actions may still require review even for high-reputation agents.
- Repeated violations should reduce trust and increase runtime scrutiny.
- Reputation evidence should be auditable and explainable.
