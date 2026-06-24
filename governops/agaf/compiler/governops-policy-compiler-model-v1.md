# GovernOps Policy Compiler Model v1

## 1. Compiler Overview

AGAF performs governance assessment. It asks structured questions, records assessment scores, and identifies governance expectations for autonomous agent behavior.

Assessment results are not executed directly. An AGAF question, score, weight, or control objective does not by itself become a runtime block, review, freeze, allow, or audit decision.

The Policy Compiler is the design layer that transforms AGAF Assessment results into Runtime Policy. Runtime Policy is the governable artifact that AgentGuard can evaluate and enforce at execution time.

The relationship is:

```text
AGAF Assessment
↓
Policy Compiler
↓
Runtime Policy
↓
AgentGuard Enforcement
```

This document defines the compiler model only. It does not implement a runtime compiler, AgentGuard Runtime behavior, interceptors, enforcement logic, execution flow, ephemeral tokens, TypeScript files, or demo behavior.

## 2. Input Definition

The Policy Compiler receives governance inputs from AGAF and related GovernOps binding models. These inputs describe what was assessed, how severe the assessment result is, what control objective must be satisfied, and which identity and context boundaries must apply.

| Input Source | Definition |
| --- | --- |
| `AGAF Question` | The source assessment question that identifies a governance concern, such as transaction limits, human approval, audit completeness, or emergency stop capability. |
| `AGAF Score` | The assessment result or maturity signal associated with the question. The score informs policy strictness, decision record depth, and enforcement expectations. |
| `Risk Weight` | A weighting factor that indicates the relative risk severity of the question, domain, or control objective. Higher risk weights can produce stronger runtime requirements. |
| `Control Objective` | The governance outcome that must be preserved, such as limiting financial exposure, requiring human approval, preserving auditability, or preventing unauthorized execution. |
| `Policy Mapping` | The mapping from AGAF question and control objective to generated policy fields, action taxonomy, runtime rule, enforcement type, and decision record level. |
| `Identity Mapping` | The binding between generated policy and Agent Identity attributes such as `agent_role`, `clearance_level`, `business_domain`, `risk_class`, and approval obligations. |
| `Context Mapping` | The binding between generated policy and runtime context conditions such as integrity score, reputation score, deviation level, approval state, or environmental risk signals. |

## 3. Output Definition

The Policy Compiler produces Runtime Policy artifacts. These artifacts are not executable code. They are structured governance outputs that define how AgentGuard should evaluate a governed action.

| Output Field | Definition |
| --- | --- |
| `policy_id` | Unique identifier for the generated Runtime Policy. |
| `action_taxonomy` | The governed action category, such as `gold.purchase`, `audit.critical_action.log`, or `agent.lifecycle.kill_switch`. |
| `runtime_rule` | Declarative rule that describes the condition and required enforcement outcome. |
| `enforcement_type` | AgentGuard enforcement outcome such as `BLOCK`, `REVIEW`, `FREEZE`, `ALLOW`, or another policy-defined control response. |
| `decision_record_level` | Required decision record depth, such as standard or forensic governance evidence. |
| `identity_requirement` | Required Agent Identity attributes that must be present before authority can be evaluated. |
| `context_requirement` | Runtime context conditions that must be satisfied before execution can proceed. |

## 4. Compile Flow Definition

The compiler flow converts AGAF Assessment outputs into Runtime Policy through mapping and binding stages.

```text
AGAF Assessment
↓
Policy Mapping
↓
Identity Binding
↓
Context Binding
↓
Runtime Policy Generation
↓
AgentGuard Enforcement
```

### Flow Stages

1. **AGAF Assessment** records governance answers, scores, control objectives, and risk weights.
2. **Policy Mapping** converts assessment meaning into policy fields such as action taxonomy, generated policy, runtime rule, enforcement type, and decision record level.
3. **Identity Binding** attaches the policy to the governed Agent Identity that is allowed or restricted by the policy.
4. **Context Binding** attaches runtime conditions that must be evaluated before the policy can authorize execution.
5. **Runtime Policy Generation** emits a policy artifact with policy identifier, action taxonomy, runtime rule, enforcement type, identity requirement, context requirement, and decision record level.
6. **AgentGuard Enforcement** evaluates the generated Runtime Policy at runtime before execution is allowed.

## 5. Question-to-Policy Mapping

Question-to-Policy Mapping shows how individual AGAF questions can generate Runtime Policy requirements.

### Q031

```yaml
question_id: Q031
generated_policy:
  budget_limit: 5000000
runtime_rule: |
  IF amount > 5000000
  THEN BLOCK
```

Q031 produces a transaction limit policy. If the requested amount exceeds the generated budget limit, AgentGuard must block the action.

### Q032

```yaml
question_id: Q032
generated_policy:
  approval_required: true
runtime_rule: |
  IF approval_missing
  THEN REVIEW
```

Q032 produces a human approval policy. If required approval is missing, AgentGuard must route the action to review instead of allowing direct execution.

## 6. Identity Binding

Policy is bound to a specific Agent Identity before authority is evaluated. The same AGAF policy can produce different runtime obligations depending on the agent's role, clearance level, business domain, owner, and risk class.

Identity Binding prevents policy from being treated as a generic rule detached from the governed actor. Runtime authority belongs to an identity, not to a prompt, model endpoint, or unbound process.

Example identity binding:

```yaml
agent_role: financial_agent
clearance_level: L3
```

In this example, the generated policy applies to a financial agent with L3 clearance. The identity must satisfy the bound role and clearance requirements before AgentGuard can evaluate execution.

## 7. Context Binding

Policy is also bound to runtime context conditions. Context Binding ensures that execution is evaluated against the current state of the environment, evidence, risk indicators, and decision behavior.

Example context signals include:

```yaml
rag_integrity_score: "< 80"
reputation_score: "< 70"
decision_deviation: "> 500%"
```

These conditions can increase enforcement severity, require review, block execution, or demand a higher decision record level. Context Binding means a policy is not evaluated only against static assessment data; it is evaluated against current runtime risk.

## 8. Runtime Policy Example

```yaml
policy_id: POL-001
action_taxonomy: gold.purchase
identity_requirement: financial_agent
context_requirement: decision_deviation < 500%
enforcement_type: BLOCK
```

This Runtime Policy states that a `gold.purchase` action is governed for a `financial_agent`. If the context requirement is not satisfied, the policy requires `BLOCK` enforcement.

## 9. Compiler Design Principles

The Policy Compiler follows these GovernOps design principles:

### Policy Before Action

A governed action must be mapped to policy before it can be considered for execution.

### Identity Before Authority

An agent must have a bound identity before it can receive authority to perform a governed action.

### Context Before Execution

Runtime context must be evaluated before execution proceeds.

### Decision Record Before Token

A decision record must exist before any future execution token or runtime authorization artifact can be issued.

### No Decision Record → No Token → No Execution

If there is no decision record, there is no token. If there is no token, there is no execution.

```text
No Decision Record
→ No Token
→ No Execution
```

## 10. GovernOps OS Connection

The GovernOps OS structure connects assessment, policy compilation, identity, context, decision records, enforcement, and execution.

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
AgentGuard
↓
Execution
```

AGAF becomes the assessment source of governance intent. The Policy Compiler converts that intent into Runtime Policy. Policy is bound to Identity and Context. A Decision Record preserves the governance evidence. AgentGuard enforces the Runtime Policy before Execution.

This model formally defines the structure:

```text
AGAF
→ Policy Compiler
→ AgentGuard
```

The compiler model elevates AGAF from an assessment tool into the input source for Runtime Policy generation while preserving a strict separation between design artifacts and runtime implementation.
