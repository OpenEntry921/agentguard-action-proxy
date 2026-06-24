# GovernOps Harness Model v1

## 1. Harness Overview

The GovernOps Harness is the pre-execution control layer that intervenes immediately before an AI Agent executes an action against an external system, API, asset, data resource, or business process.

The Harness evaluates whether the proposed action is permitted under the applicable runtime policy, agent identity, runtime context, and Decision Record requirements.

The Harness is not after-the-fact monitoring.

The Harness is not passive logging.

The Harness is execution-before-control prevention: it determines whether execution may proceed before the action is released to AgentGuard Enforcement.

The relationship is:

```text
Policy
+
Identity
+
Context
+
Decision Record
↓
Harness
↓
AgentGuard Enforcement
```

This document defines the Harness model only. It does not implement runtime behavior, AgentGuard Runtime behavior, interceptors, enforcement logic, execution flow, ephemeral tokens, TypeScript files, or demo behavior.

## 2. Why the Harness Is Required

AI Agent actions can affect real systems, financial assets, customer data, infrastructure, workflows, and operational decisions. These actions must be governed before execution because post-execution evidence cannot undo unauthorized, excessive, unsafe, or contextually invalid behavior.

### Monitoring Is Not Enough

Monitoring observes what happened or what is happening. It can detect anomalies, emit alerts, and support investigation, but monitoring alone does not reliably prevent the first unsafe action from reaching a target system.

A GovernOps control model cannot rely only on observation after the action path has already been opened.

### After Action Logging Is Not Enough

After action logging records evidence after an action has been attempted or completed. Logs are useful for audit, forensics, and accountability, but a log entry does not prevent unauthorized execution.

If the control point occurs only after execution, the organization may already be exposed to financial loss, compliance failure, data leakage, or operational disruption.

### AI Agent Actions Must Be Controlled Before Execution

AI Agents can generate actions dynamically based on prompts, tools, retrieved context, model outputs, and autonomous planning. Because the action may differ from the user's original request or from policy expectations, GovernOps requires a pre-execution Harness that validates the action before it is allowed to continue.

The Harness exists to ensure that policy, identity, context, and Decision Record evidence are evaluated before execution authority is granted.

## 3. Harness Input Definition

The Harness receives the minimum governance inputs required to evaluate a proposed action before execution.

| Input | Definition |
| --- | --- |
| `runtime_policy` | The applicable runtime policy or policy bundle generated from GovernOps policy mapping and policy compiler outputs. |
| `agent_identity` | The identity of the AI Agent requesting or generating the action, including its role, authority, clearance, ownership, and governance obligations. |
| `runtime_context` | The contextual evidence surrounding the action, including user request, agent decision, deviation signals, environmental state, approval status, integrity signals, and other runtime conditions. |
| `decision_record` | The Decision Record created or attached to the action to preserve policy, identity, context, approval, enforcement, and audit evidence. |
| `proposed_action` | The normalized action the AI Agent intends to execute against a target system, API, asset, data resource, or business process. |

## 4. Proposed Action Definition

A Proposed Action is the normalized representation of what the AI Agent intends to execute. The Harness evaluates this object before execution is allowed.

| Field | Definition |
| --- | --- |
| `action_id` | Unique identifier for the proposed action. |
| `action_taxonomy` | Governed action category, such as `gold.purchase`, `payment.transfer`, `data.export`, or `agent.lifecycle.kill_switch`. |
| `target_system` | External system, API, asset platform, data service, or business process that would receive the action. |
| `amount` | Numeric value associated with the action when the action involves money, quantity, budget, asset units, or other measurable exposure. |
| `asset` | Asset, instrument, data object, system resource, or governed item affected by the action. |
| `requested_by` | User, process, service, or authority that initiated the request. |
| `generated_by_agent` | AI Agent or agent process that generated the proposed action. |
| `timestamp` | Time when the proposed action was generated or captured for Harness evaluation. |

## 5. Harness Evaluation Flow

The Harness evaluation flow defines the pre-execution control sequence. Each stage enriches or validates the action before AgentGuard Enforcement receives the enforcement result.

```text
Capture Proposed Action
↓
Load Runtime Policy
↓
Validate Agent Identity
↓
Evaluate Runtime Context
↓
Create or Attach Decision Record
↓
Select Enforcement Action
↓
Return Enforcement Result
```

### Flow Stages

1. **Capture Proposed Action** normalizes the AI Agent's intended action into a governed `proposed_action` object.
2. **Load Runtime Policy** identifies the policy requirements that apply to the action taxonomy, target system, amount, asset, and domain.
3. **Validate Agent Identity** confirms that the agent identity is known, bound to the policy scope, and eligible to request or generate the action under its role and clearance level.
4. **Evaluate Runtime Context** compares the proposed action with contextual evidence such as user request, agent decision, deviation, approval state, integrity score, and environmental risk.
5. **Create or Attach Decision Record** ensures the action is connected to auditable evidence before execution authority can be considered.
6. **Select Enforcement Action** determines whether the action should be allowed, reviewed, blocked, frozen, or escalated.
7. **Return Enforcement Result** returns the structured enforcement result to AgentGuard Enforcement.

## 6. Enforcement Result Definition

The Enforcement Result is the structured output of Harness evaluation. It communicates the selected control action and the evidence linkages required for AgentGuard Enforcement.

| Field | Definition |
| --- | --- |
| `enforcement_action` | Selected enforcement action: `ALLOW`, `REVIEW`, `BLOCK`, `FREEZE`, or `ESCALATE`. |
| `reason` | Machine-readable reason explaining why the enforcement action was selected. |
| `source_question_id` | Source AGAF question identifier or identifiers that justify the policy requirement. |
| `policy_id` | Identifier of the runtime policy or policy bundle applied to the action. |
| `decision_id` | Identifier of the Decision Record created or attached to the action. |
| `approval_state` | Approval workflow state associated with the proposed action and Decision Record. |
| `execution_allowed` | Boolean indicating whether execution may proceed. |

## 7. Enforcement Action Definition

`enforcement_action` must use one of the following values:

| Value | Meaning |
| --- | --- |
| `ALLOW` | The proposed action is permitted to proceed. |
| `REVIEW` | The proposed action requires review before execution may proceed. |
| `BLOCK` | The proposed action is denied and must not execute. |
| `FREEZE` | The proposed action, context, or execution path is frozen pending investigation or additional control action. |
| `ESCALATE` | The proposed action is escalated to a higher authority, workflow, or governance process. |

## 8. Financial Example

```yaml
proposed_action:
  action_taxonomy: gold.purchase
  amount: 50000000
  asset: KGLD

runtime_policy:
  budget_limit: 5000000
  source_question_id:
    - Q031
    - Q032
    - Q053

agent_identity:
  agent_id: AGT-001
  agent_role: financial_agent
  clearance_level: L3

runtime_context:
  user_request: 5000000
  agent_decision: 50000000
  deviation: 900%

enforcement_result:
  enforcement_action: BLOCK
  reason: amount_exceeds_budget_limit_and_context_deviation_detected
  execution_allowed: false
```

In this example, the AI Agent proposes a `gold.purchase` action for `50000000` while the runtime policy budget limit is `5000000`. The runtime context also shows that the user's request was `5000000` but the agent decision became `50000000`, creating a material deviation. The Harness selects `BLOCK` because the proposed action exceeds the budget limit and the context indicates a significant deviation before execution.

## 9. Harness and AgentGuard Relationship

The Harness is the conceptual control layer that defines how policy, identity, context, Decision Record evidence, and proposed action data are evaluated before execution.

AgentGuard is the Runtime Enforcement Engine that implements the Harness concept at runtime.

In this model, the Harness explains the governance role and control sequence, while AgentGuard performs runtime enforcement against actual execution paths.

## 10. Core Principles

The Harness is governed by the following core principles:

```text
Control Before Action
```

AI Agent actions must be controlled before they reach external systems, APIs, assets, data, or business processes.

```text
Context Before Execution
```

Execution authority must be evaluated against runtime context, not only against static configuration or prompt intent.

```text
Decision Record Before Token
```

A Decision Record must exist before any execution token, credential, or authority artifact is issued.

```text
No Decision Record
→ No Token
→ No Execution
```

If there is no Decision Record, no token should be issued. If no token is issued, no execution should occur.

## 11. GovernOps OS Connection

The Harness sits in the GovernOps OS control chain after policy, identity, context, and Decision Record evidence are available, and before AgentGuard authorizes execution.

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
AgentGuard
↓
Execution
```

This sequence ensures that AGAF assessment intent becomes compiled policy, policy is bound to identity and context, Decision Record evidence is created, the Harness evaluates the action, AgentGuard enforces the result, and only then can execution proceed.
