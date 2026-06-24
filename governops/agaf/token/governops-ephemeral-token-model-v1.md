# GovernOps Ephemeral Token Model v1

## 1. Ephemeral Token Overview

An Ephemeral Token is a short-lived authentication token that represents the execution authority of an AI Agent.

GovernOps does not trust long-lived permissions. Instead, GovernOps issues action-level, short-lived execution authority for exactly one specific action.

An Ephemeral Token is issued only after Harness validation succeeds. The token is discarded immediately after execution completes.

## 2. Why Ephemeral Tokens Are Needed

GovernOps replaces long-lived permission models because static or session-scoped authority creates avoidable execution risk.

### Static Permission Risk

Static permissions remain available even when the specific execution context has changed. This can allow an agent or compromised process to perform actions that were never approved for the current decision.

### Session Hijacking Risk

Session-scoped authority can be reused by an attacker if the session is hijacked. Ephemeral Tokens reduce the useful lifetime of captured authority by binding execution authority to one validated action.

### Privilege Escalation Risk

Broad or persistent permissions can be abused to move from an approved action into a more privileged action. GovernOps limits authority to the approved action taxonomy and the validated Decision Record.

### Replay Attack Risk

Reusable credentials can be replayed after the original execution path has completed. Ephemeral Tokens are single-use and are burned after execution, expiration, revocation, or freeze events.

## 3. Token Entity Definition

| Field | Description |
| --- | --- |
| `token_id` | Unique identifier for the Ephemeral Token. |
| `decision_id` | Identifier of the Decision Record that authorized token consideration. |
| `policy_id` | Identifier of the policy that applies to the action. |
| `agent_id` | Identifier of the AI Agent receiving execution authority. |
| `action_taxonomy` | GovernOps action classification for the single permitted action. |
| `approval_state` | Approval state associated with the Decision Record and policy requirements. |
| `issued_at` | Timestamp when the token was issued. |
| `expires_at` | Timestamp when the token is no longer valid. |
| `ttl_seconds` | Time-to-live duration in seconds. |
| `execution_limit` | Maximum number of executions permitted by the token. For this model, the value is `1`. |
| `status` | Current token status. |

## 4. Token Status Definition

Allowed token status values are:

| Status | Meaning |
| --- | --- |
| `ISSUED` | Token has been issued and is eligible for the single approved execution before expiration. |
| `USED` | Token has been consumed by an execution attempt. |
| `EXPIRED` | Token exceeded its TTL before valid execution completed. |
| `REVOKED` | Token was invalidated due to policy revocation, Harness freeze, or another authority withdrawal event. |
| `BURNED` | Token has been permanently discarded and cannot be reused. |

## 5. Token Lifecycle

```text
Decision Record Created
↓
Harness Validation
↓
Token Issued
↓
Execution
↓
Token Burned
```

## 6. Token Issuance Rules

Ephemeral Token issuance is allowed only when all applicable issuance rules are satisfied.

### Decision Record Required

A token must not be issued unless a Decision Record exists for the requested action.

### Approval Required When Applicable

If policy requires approval, the Decision Record must show the required approval state before a token can be issued.

### Harness Validation Required

Harness validation must pass before token issuance. A token must not be issued for an action that Harness has not validated as executable.

### Policy Validation Required

The applicable policy must validate the requested action, agent identity, context, approval requirements, and action taxonomy before token issuance.

## 7. Financial Example

```yaml
token_id: TOK-001
decision_id: DEC-001
agent_id: AGT-001
action_taxonomy: gold.purchase
approval_state: APPROVED
ttl_seconds: 30
execution_limit: 1
status: ISSUED
```

## 8. Burn Rule Definition

| Event | Result |
| --- | --- |
| Execution Completed | Token Burned |
| TTL Expired | Token Burned |
| Policy Revoked | Token Revoked |
| Harness Freeze | Token Revoked |

Burn and revocation rules ensure that execution authority cannot survive beyond the exact validated action window.

## 9. GovernOps Principle

```text
No Decision Record
→ No Token

No Token
→ No Execution
```

This principle makes execution authority dependent on recorded decisioning and tokenized action-level authorization.

## 10. Harness Integration

Harness determines whether execution is allowed to proceed. It validates the action path, policy requirements, decision state, and execution readiness.

The Ephemeral Token grants execution authority after Harness validation succeeds.

## 11. AgentGuard Integration

AgentGuard does not allow execution without a valid Ephemeral Token.

If a request lacks a valid token, AgentGuard must treat the execution as unauthorized.

## 12. GovernOps OS Connection

```text
AGAF
↓
Policy Compiler
↓
Policy
↓
Identity
↓
Context
↓
Decision Record
↓
Harness
↓
Ephemeral Token
↓
AgentGuard
↓
Execution
```

The Ephemeral Token completes the GovernOps OS execution authority chain by connecting validated decisions to controlled execution.
