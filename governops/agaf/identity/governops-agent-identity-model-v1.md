# GovernOps Agent Identity Model v1

## 1. Agent Identity Overview

GovernOps does not govern a simple LLM instance.

GovernOps governs an Agent Identity that has policy obligations bound to it. In the AGAF operating model, the controlled subject is not the model endpoint, prompt, or runtime process by itself. The controlled subject is the identity that represents an agent's business role, ownership, clearance, approval requirements, and risk posture.

The relationship is:

```text
AGAF
↓
Policy
↓
Agent Identity
↓
AgentGuard
```

This model defines who is subject to AGAF policy evaluation before runtime enforcement, implementation, authentication, or token mechanisms are introduced.

## 2. Identity Entity Definition

An Agent Identity is a governance entity that describes the agent being controlled by GovernOps.

| Field | Definition |
| --- | --- |
| `agent_id` | Unique identifier assigned to the governed agent identity. |
| `agent_name` | Human-readable name for the agent identity. |
| `agent_role` | Functional role that describes the type of work the agent performs. |
| `owner` | Team, department, or accountable party responsible for the agent identity. |
| `business_domain` | Business area in which the agent operates, such as finance, support, compliance, reporting, or infrastructure. |
| `clearance_level` | Governance level that determines the maximum sensitivity, authority, and action scope assigned to the agent. |
| `approval_required` | Boolean value indicating whether the agent requires approval before performing governed actions. |
| `approval_chain` | Required approver path for the agent identity based on role, clearance level, and risk class. |
| `risk_class` | Risk classification assigned to the agent, such as `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL`. |
| `status` | Lifecycle state of the agent identity. |
| `created_at` | Timestamp indicating when the agent identity was created. |

## 3. Agent Role Definition

Agent roles classify the purpose and operating context of an Agent Identity. Roles are used to bind policies, assign approval expectations, and establish default risk assumptions.

Example roles include:

| Agent Role | Description |
| --- | --- |
| `automated_buyer` | Performs purchasing or procurement-related actions within defined limits. |
| `financial_agent` | Performs financial analysis, treasury actions, payment preparation, or asset-related workflows. |
| `customer_service_agent` | Handles customer inquiries, support workflows, and service operations. |
| `compliance_agent` | Reviews activity for compliance obligations, governance gaps, and regulatory alignment. |
| `reporting_agent` | Generates, summarizes, or distributes operational and governance reports. |
| `infrastructure_agent` | Supports infrastructure operations, monitoring, deployment assistance, or internal system workflows. |

## 4. Clearance Level Definition

Clearance levels define the authority boundary of an Agent Identity. Higher levels indicate broader action scope, greater business sensitivity, and stronger approval expectations.

| Clearance Level | Description |
| --- | --- |
| `L1` | Low-sensitivity agent activity with narrow scope and limited operational impact. |
| `L2` | Routine business activity with moderate data access or bounded workflow authority. |
| `L3` | Sensitive business activity that may affect financial, compliance, customer, or operational outcomes. |
| `L4` | High-impact activity requiring strong governance controls, multi-party review, or elevated oversight. |
| `L5` | Critical activity with executive-level impact, strategic authority, or material business risk. |

## 5. Approval Chain Definition

Approval chains define who must approve governed activity for an Agent Identity. Approval requirements may be determined by clearance level, agent role, risk class, business domain, or bound AGAF policies.

Example approval chains:

| Clearance Level | Approval Chain Example |
| --- | --- |
| `L1` | `direct_manager` |
| `L2` | `direct_manager` |
| `L3` | `team_lead` + `risk_officer` |
| `L4` | `department_head` + `risk_officer` + `compliance_officer` |
| `L5` | `executive_approval` |

## 6. Policy Binding Definition

An Agent Identity is bound to AGAF policies. The identity determines which policies apply to the agent and provides the context needed for AgentGuard evaluation.

Policy binding is based on identity attributes such as `agent_role`, `clearance_level`, `business_domain`, and `risk_class`.

Example policy binding:

```yaml
agent_role: financial_agent
clearance_level: L3
policy:
  - Q031
  - Q032
  - Q053
```

In this example, a financial agent with L3 clearance is governed by the AGAF policy set identified by `Q031`, `Q032`, and `Q053`.

## 7. Identity Lifecycle Definition

The Agent Identity lifecycle defines the governance state transitions for an agent identity.

```text
Create
↓
Bind Policy
↓
Activate
↓
Suspend
↓
Freeze
↓
Terminate
```

| Lifecycle State | Definition |
| --- | --- |
| `Create` | Establish the initial Agent Identity record and assign ownership. |
| `Bind Policy` | Attach AGAF policies based on the identity's role, clearance level, business domain, and risk class. |
| `Activate` | Mark the identity as eligible for AgentGuard evaluation. |
| `Suspend` | Temporarily disable the identity from governed activity while preserving the identity record. |
| `Freeze` | Lock the identity due to risk, investigation, compliance review, or governance exception. |
| `Terminate` | Retire the identity and end its eligibility for governed activity. |

## 8. Financial Agent Example

```yaml
agent_id: AGT-001
agent_name: Gold Purchase Agent
agent_role: financial_agent
owner: treasury_team
business_domain: treasury
clearance_level: L3
approval_required: true
approval_chain:
  - risk_officer
risk_class: HIGH
status: Activate
created_at: 2026-06-24T00:00:00Z
```

This example represents a financial Agent Identity for a treasury workflow. Because it has L3 clearance and a HIGH risk class, it requires approval from a risk officer before governed financial actions are accepted by the operating governance model.

## 9. GovernOps Runtime Connection

AGAF creates policies.

Agent Identity holds the policies that apply to a governed agent.

AgentGuard evaluates agent behavior based on the Agent Identity, including the identity's role, clearance level, approval chain, risk class, and bound AGAF policies.

The resulting conceptual structure is:

```text
AGAF
↓
Policy
↓
Identity
↓
AgentGuard
↓
Decision Record
```

This document defines the identity layer only. It does not implement agent creation, runtime enforcement, authentication, policy enforcement, ephemeral tokens, TypeScript models, interceptors, runtime engines, or decision record generation.
