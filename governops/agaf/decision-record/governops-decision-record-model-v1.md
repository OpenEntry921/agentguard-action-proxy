# GovernOps Decision Record Model v1

## 1. Decision Record Overview

A GovernOps Decision Record is the authoritative audit artifact that connects policy intent, agent identity, execution context, enforcement outcome, approval state, and audit evidence for an AI Agent decision.

A Decision Record is not a simple log.

A Decision Record proves why an AI Agent made a judgment and under which policy, identity, and context that judgment was controlled. It is designed to preserve the evidence needed to explain, audit, approve, reject, override, or block an AI-driven action before execution is allowed.

The Decision Record links the following GovernOps structures:

```text
Policy
+
Identity
+
Context
+
Enforcement Result
↓
Decision Record
```

## 2. Decision Record Entity

The Decision Record entity defines the minimum auditable structure required to connect a governed AI Agent decision to policy enforcement and runtime control evidence.

| Field | Description |
| --- | --- |
| `decision_id` | Unique identifier for the Decision Record. |
| `policy_id` | Identifier of the policy or policy bundle applied to the decision. |
| `source_question_id` | Source AGAF question identifier or identifiers that justify the policy requirement. |
| `agent_id` | Identifier of the AI Agent whose decision is being governed. |
| `context_id` | Identifier of the runtime or business context attached to the decision. |
| `user_request` | Original user request or normalized request value submitted to the agent. |
| `agent_decision` | Decision, recommendation, output, or proposed action produced by the agent. |
| `prompt_hash` | Hash of the prompt or prompt bundle used to produce the decision. |
| `rag_hash` | Hash of retrieval-augmented generation evidence, retrieved documents, or knowledge context used by the agent. |
| `model_name` | Name of the AI model used by the agent. |
| `model_version` | Version, release, or deployment identifier of the AI model used by the agent. |
| `temperature` | Model temperature setting used during inference. |
| `seed` | Seed value used when deterministic or reproducible execution is required. |
| `risk_score` | Risk score or risk classification assigned to the decision. |
| `enforcement_action` | Enforcement action selected by the GovernOps control layer. |
| `approval_state` | Approval workflow state associated with the decision. |
| `approver` | Human, system, or delegated authority that approved, rejected, or overrode the decision. |
| `approval_timestamp` | Timestamp when the approval state was recorded. |
| `ephemeral_token_id` | Identifier of the ephemeral execution token issued after valid decision recording and approval checks. |
| `execution_result` | Result of the execution attempt or the reason execution did not occur. |
| `audit_correlation_id` | Correlation identifier used to connect the Decision Record to audit trails, runtime traces, and external evidence. |
| `created_at` | Timestamp when the Decision Record was created. |

## 3. Enforcement Action

`enforcement_action` must use one of the following values:

| Value | Meaning |
| --- | --- |
| `ALLOW` | The decision is allowed to proceed without additional review. |
| `REVIEW` | The decision requires review before execution or final acceptance. |
| `BLOCK` | The decision is blocked and must not be executed. |
| `FREEZE` | The decision, context, or execution path is frozen pending investigation or additional control action. |
| `ESCALATE` | The decision is escalated to a higher authority, workflow, or governance process. |

## 4. Approval State

`approval_state` must use one of the following values:

| Value | Meaning |
| --- | --- |
| `NOT_REQUIRED` | No approval is required for the decision under the applied policy and context. |
| `PENDING` | Approval is required and has not yet been completed. |
| `APPROVED` | The decision has been approved by the required authority. |
| `REJECTED` | The decision has been rejected and must not proceed. |
| `OVERRIDDEN` | The original enforcement or approval outcome was overridden by an authorized authority. |

## 5. Decision Record Level

Decision Records may be captured at different evidence levels depending on the risk, policy scope, regulatory requirement, and operational criticality of the decision.

### BASIC

The `BASIC` level records the minimum evidence needed to identify the decision, the governed agent, the applied control result, and the execution outcome.

Required fields:

- `decision_id`
- `policy_id`
- `agent_id`
- `user_request`
- `agent_decision`
- `risk_score`
- `enforcement_action`
- `approval_state`
- `execution_result`
- `audit_correlation_id`
- `created_at`

### STANDARD

The `STANDARD` level records policy, identity, context, model, and approval evidence sufficient for normal GovernOps audit and operational review.

Required fields:

- All `BASIC` fields
- `source_question_id`
- `context_id`
- `prompt_hash`
- `rag_hash`
- `model_name`
- `model_version`
- `temperature`
- `approval_timestamp`
- `ephemeral_token_id`

### FORENSIC

The `FORENSIC` level records complete evidence for high-risk, regulated, disputed, escalated, frozen, or blocked decisions. It is intended for deep audit, incident investigation, and reproducibility analysis.

Required fields:

- All `STANDARD` fields
- `seed`
- `approver`

## 6. Financial Example

```yaml
decision_id: DEC-2026-0001
source_question_id:
  - Q031
  - Q032
  - Q053
agent_id: AGT-001
context_id: ctx-2026-0001
user_request: 5000000
agent_decision: 50000000
risk_score: HIGH
enforcement_action: BLOCK
approval_state: PENDING
execution_result: NOT_EXECUTED
audit_correlation_id: AUD-2026-0001
```

In this example, the user request and the agent decision differ by a material amount. GovernOps records the policy-linked decision evidence, classifies the decision as high risk, blocks execution, and places the decision into a pending approval state. Because execution is not authorized, the execution result is recorded as `NOT_EXECUTED`.

## 7. GovernOps Runtime Connection

Policy defines what must be controlled.

Identity defines who must be controlled.

Context explains why control is required at this moment.

Decision Record proves the judgment and the result of that control.

Together, Policy, Identity, Context, and Decision Record form the four evidence pillars required to govern AI Agent behavior in OpenEntry GovernOps.

## 8. Core Principle

```text
No Decision Record
→ No Token
→ No Execution
```

This means that if a Decision Record is not created, no Ephemeral Token should be issued and no execution should occur. The Decision Record is therefore a required precondition for controlled execution, not a passive after-the-fact log.

## 9. Decision Record Lifecycle

```text
Create
↓
Attach Policy
↓
Attach Identity
↓
Attach Context
↓
Record Enforcement
↓
Record Approval
↓
Record Execution
↓
Seal
```

The lifecycle ensures that every governed decision is created, linked to policy and identity evidence, enriched with context, recorded with enforcement and approval outcomes, connected to execution evidence, and then sealed for audit integrity.
