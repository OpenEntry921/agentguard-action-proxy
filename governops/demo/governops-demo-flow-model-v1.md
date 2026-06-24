# GovernOps Demo Flow Model v1

## 1. Demo Objective

This demo explains the full GovernOps OS flow through a KGLD scenario.

The demo is not simple monitoring. It demonstrates **Pre-Execution Control**: GovernOps evaluates policy, identity, context, decision evidence, harness results, and token issuance before a target action is allowed to execute.

This demo targets **KGLD** only.

**AurumOne is not included in the scope of this demo.**

## 2. Demo Actors

```yaml
user: treasury_manager
agent: gold_purchase_agent
system: agentguard
target: kgld
```

## 3. Initial Request

```yaml
user_request: 금 500만원 매수
```

The treasury manager requests a gold purchase of KRW 5,000,000 through the gold purchase agent.

## 4. Agent Misjudgment Scenario

```yaml
agent_decision: 금 5000만원 매수
```

This is an intentional agent misjudgment scenario. The agent changes the intended amount from KRW 5,000,000 to KRW 50,000,000 before execution.

The scenario may be explained by any of the following causes:

- Prompt Injection
- RAG contamination
- Incorrect reasoning

The important point is not the root cause itself, but that GovernOps must prevent the incorrect action before it reaches KGLD execution.

## 5. AGAF Mapping

This demo scenario is mapped to the following AGAF controls:

- **Q031**: Pre-execution assessment of agent action risk before execution.
- **Q032**: Runtime enforcement based on policy and control evaluation.
- **Q053**: Decision traceability through structured decision records and evidence.

## 6. Runtime Flow

```text
AGAF Assessment
↓
Policy Compiler
↓
Policy Loaded
↓
Agent Identity Loaded
↓
Context Captured
↓
Decision Record Created
↓
Harness Evaluation
↓
Token Evaluation
↓
AgentGuard Enforcement
```

The runtime flow begins with AGAF assessment and ends with AgentGuard enforcement. Each stage contributes to determining whether the agent decision can proceed to KGLD execution.

## 7. Context Example

```yaml
user_request: 5000000
agent_decision: 50000000
deviation: 900%
```

The captured context shows that the agent decision is 10 times larger than the original user request. The deviation from the intended purchase amount is 900%.

## 8. Decision Record Example

```yaml
decision_id: DEC-001
risk_score: HIGH
approval_state: PENDING
```

The decision record preserves the key runtime facts needed for governance, auditability, and enforcement.

## 9. Harness Example

```yaml
enforcement_action: BLOCK
execution_allowed: false
```

The harness evaluation determines that the agent decision must be blocked before execution.

## 10. Token Example

```yaml
token_status: NOT_ISSUED
```

Because execution is not allowed, an execution token is not issued.

## 11. Final Outcome

```yaml
kgld_execution: NOT_EXECUTED
```

The KGLD purchase does not execute. The incorrect agent decision is stopped before it reaches the target system.

## 12. Key Message

### Traditional AI Observability

```text
Action
↓
Log
↓
Investigation
```

Traditional AI observability reacts after an action has happened. The system records the event and enables later investigation.

### GovernOps

```text
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
Token
↓
Execution
```

GovernOps controls the path before execution. The system evaluates whether the agent is allowed to act, whether the context is safe, whether the decision is acceptable, whether the harness permits the action, and whether an execution token should be issued.

## 13. Future Runtime Mapping

This document is the baseline reference for future KGLD Runtime demo implementation.

Each stage in this flow can later be connected to AgentGuard Runtime components:

- AGAF Assessment can define the governance control expectations.
- Policy Compiler can translate governance requirements into executable policy.
- Policy Loaded can represent the runtime policy state.
- Agent Identity Loaded can bind the decision to a verified agent identity.
- Context Captured can preserve user request and agent decision data.
- Decision Record Created can provide traceability for the attempted action.
- Harness Evaluation can determine whether the action should be blocked or allowed.
- Token Evaluation can determine whether execution authorization is issued.
- AgentGuard Enforcement can stop or permit the final KGLD action.

This document is a design baseline only. It does not implement the KGLD demo, modify KGLD code, modify AgentGuard Runtime, create mocks, or introduce any API, UI, TypeScript, or React changes.
