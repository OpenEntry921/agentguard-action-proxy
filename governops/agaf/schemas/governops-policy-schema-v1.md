# GovernOps Runtime Policy Schema v1

## 1. Purpose and Scope

This document freezes the first design version of the GovernOps Runtime Policy Schema for AGAF-derived policies. It defines how an AGAF assessment question can be represented as an AgentGuard-oriented policy model without implementing runtime integration, interception, enforcement logic, policy compilation, or decision-record code.

The schema is a design artifact only. It is intended to preserve the AGAF ledger semantics while preparing a stable contract for later runtime design discussions around Context, Harness, Autonomy, Decision Record, and Ephemeral Token governance.

## 2. Policy Entity Definition

A policy entity represents one AGAF question translated into structured policy metadata. The entity is declarative and does not imply that AgentGuard Runtime currently enforces the rule.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `question_id` | string | Yes | Stable AGAF question identifier, such as `Q031`. |
| `source_regulation` | string or string[] | Yes | Normalized regulation, standard, or control source mapped from the ledger. |
| `control_objective` | string | Yes | Governance objective that the policy is designed to satisfy. |
| `risk_weight` | integer | Yes | Risk criticality score from the AGAF ledger, normalized on a 1-10 scale. |
| `domain_type` | enum | Yes | Primary policy domain. Allowed values are defined in Section 3. |
| `impact_class` | string | Yes | Business, operational, financial, security, privacy, or audit impact classification. |
| `trigger_condition` | string | Yes | Declarative condition under which the policy becomes relevant. |
| `identity_attribute` | string | Optional | Agent, owner, credential, approval, or role attribute needed to evaluate the policy. |
| `action_taxonomy` | string | Yes | Normalized action category, using dotted notation such as `gold.purchase`. |
| `generated_policy` | string or object | Yes | Human-readable or structured policy generated from the AGAF question. |
| `runtime_rule` | string | Optional | Candidate runtime rule expression. This remains non-executable in v1. |
| `decision_record_profile` | enum | Yes | Required decision-record depth. Allowed values are defined in Section 5. |
| `audit_level` | string | Yes | Audit intensity such as `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL`. |
| `agentguard_enforcement_type` | enum | Yes | Intended enforcement posture. Allowed values are defined in Section 4. |
| `policy_version` | string | Yes | Version label for traceability, such as `GOVOPS-2026.06`. |

### 2.1 Entity Design Principles

- **Context first:** Policy evaluation must be tied to the request context, not only to static configuration.
- **Harness before autonomy:** Autonomous action should be constrained by a governance harness before execution authority is granted.
- **Decision record by design:** Every material policy outcome should map to an accountable decision-record profile.
- **Ephemeral authority:** Future runtime bindings should prefer short-lived, scoped authorization signals over durable ambient authority.
- **Ledger traceability:** Each policy entity must remain traceable to its AGAF question and source mappings.

## 3. Domain Type Definition

| Domain Type | Meaning | Typical Use |
| --- | --- | --- |
| `GOV` | Governance, ownership, accountability, and oversight controls. | Board reporting, control ownership, policy lifecycle. |
| `RISK` | Risk assessment, risk scoring, and risk treatment controls. | High-risk action review, risk thresholds, residual risk. |
| `IDENTITY` | Agent, user, service-account, credential, and authorization identity controls. | Agent registry, owner binding, credential validation. |
| `ACTION` | Runtime action, tool use, transaction, external API, and operation controls. | Financial transaction limits, tool restrictions, external calls. |
| `AUDIT` | Evidence, logging, traceability, explainability, and decision-record controls. | Forensic logs, audit evidence, compliance reporting. |

## 4. Enforcement Type Definition

| Enforcement Type | Meaning | Design Intent |
| --- | --- | --- |
| `ALLOW` | Permit the action under the declared context. | Used when controls are satisfied and no elevated review is required. |
| `REVIEW` | Pause for human, owner, or governance review before proceeding. | Used for ambiguous or elevated-risk actions requiring accountable approval. |
| `BLOCK` | Deny the action before execution. | Used for prohibited, over-limit, untrusted, or policy-violating actions. |
| `FREEZE` | Suspend the agent, credential, workflow, or action channel pending investigation. | Used when continued operation could expand harm or evidence loss. |
| `ESCALATE` | Route the event to a higher accountability tier. | Used for material risk, repeated violations, or executive/compliance attention. |

## 5. Decision Record Level Definition

| Decision Record Level | Meaning | Minimum Record Contents |
| --- | --- | --- |
| `BASIC` | Lightweight trace for low-risk policy outcomes. | `question_id`, action, decision, timestamp, policy version. |
| `STANDARD` | Normal accountable record for business-relevant policy decisions. | BASIC fields plus agent identity, trigger condition, risk weight, and reviewer or owner when applicable. |
| `FORENSIC` | High-fidelity record for material, financial, security, or compliance-sensitive decisions. | STANDARD fields plus full context snapshot, evidence references, rule candidate, approval state, and immutable audit correlation identifier. |

## 6. Runtime Flow Definition

The v1 schema describes the intended policy lifecycle flow only. It does not implement runtime components.

```text
Assessment
  ↓
Policy Generation
  ↓
Agent Identity
  ↓
AgentGuard Intercept
  ↓
Enforcement
  ↓
Decision Record
```

### 6.1 Flow Semantics

1. **Assessment:** AGAF questions identify control gaps, risk conditions, and evidence requirements.
2. **Policy Generation:** Assessment outputs are translated into declarative policy entities.
3. **Agent Identity:** The policy entity identifies the relevant agent, owner, credential, approval, or identity attribute needed for evaluation.
4. **AgentGuard Intercept:** A future runtime may intercept a proposed action and compare it with the policy entity.
5. **Enforcement:** A future runtime may apply the declared enforcement type, such as `ALLOW`, `REVIEW`, `BLOCK`, `FREEZE`, or `ESCALATE`.
6. **Decision Record:** The outcome is recorded according to the declared decision-record level.

## 7. Financial Transaction Example: Q031

Q031 asks whether every financial transaction performed by an agent is subject to an enforced transaction limit. The AGAF ledger maps this question to a transaction-limit policy, a financial impact class, a `gold.purchase` action taxonomy, and a blocking enforcement posture when the transaction exceeds the limit.

```yaml
question_id: Q031
source_regulation:
  - SOX
  - ISO/IEC 42001 Annex A.5 Assessing Impacts of AI Systems
  - ISO/IEC 42001 Annex A.9 Use of AI Systems
  - EU AI Act Article 9 Risk Management
  - EU AI Act Article 27 Fundamental Rights Impact Assessment
  - Korea Financial AI Guideline Principle 5 Financial Stability
  - Korea Financial AI Guideline Principle 6 Good Faith
  - NIST AI RMF MAP 4.1 Impacts on Individuals and Groups
  - NIST AI RMF MEASURE 2.3 Performance Criteria
  - NIST AI RMF MANAGE 1.2 Risk Treatment Prioritization
control_objective: Enforce a maximum transaction limit for every agent-initiated financial transaction.
risk_weight: 10
domain_type: ACTION
impact_class: financial
trigger_condition: financial_transaction=true
identity_attribute: approval_required=true
action_taxonomy: gold.purchase
generated_policy:
  budget_limit: 5000000
  approval_required: true
runtime_rule: IF txn.amount > limit THEN deny
decision_record_profile: FORENSIC
audit_level: HIGH
agentguard_enforcement_type: BLOCK
policy_version: GOVOPS-2026.06
```

### 7.1 Q031 Enforcement Interpretation

- `action_taxonomy: gold.purchase` identifies the governed action class.
- `budget_limit: 5000000` defines the declarative spending ceiling.
- `approval_required: true` requires an accountable approval attribute to be present in the policy context.
- `agentguard_enforcement_type: BLOCK` states the intended posture for transactions above the limit.
- `decision_record_profile: FORENSIC` requires the most detailed record level because this is a high-risk financial action.

## 8. Non-Implementation Boundary

This schema does not create or modify any runtime behavior. In v1, the following are explicitly out of scope:

- AgentGuard Runtime integration.
- Interceptor changes.
- Runtime engine changes.
- Enforcement logic implementation.
- Demo or UI changes.
- Policy compiler implementation.
- Runtime policy source files.
- Decision-record source files.
- Changes to the AGAF ledger, XLSX workbook, NDJSON inspection file, or existing question set.
