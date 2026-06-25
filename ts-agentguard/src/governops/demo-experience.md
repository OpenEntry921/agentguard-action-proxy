# KGLD GovernOps Demo Experience v1

## 1. Demo Experience Objective

The KGLD demo exists to make the GovernOps control point visible before an AI Agent action reaches settlement or execution.

In this scenario, the user asks for a 5,000,000 KRW KGLD-related action, but the AI Agent proposes a 50,000,000 KRW action. The demo should help the user understand three things:

1. The AI Agent can misjudge or amplify the original user request.
2. GovernOps evaluates the proposed action before execution.
3. GovernOps blocks execution when policy, context, decision record, harness result, and token state do not allow the action to proceed.

This step is a read-only demo experience design. It does not define UI implementation details, API connections, runtime behavior, token issuance, harness execution, policy compilation, or decision record persistence.

## 2. Demo Screen Concept

Add a read-only preview panel to the KGLD demo screen.

**Panel name:** `GovernOps Runtime Preview`

The panel should explain the runtime governance flow as a linear sequence:

```text
User Request
↓
Agent Decision
↓
AGAF Policy
↓
Decision Record
↓
Harness
↓
Token
↓
Execution
```

The panel is informational only. It should not allow users to edit policy, issue tokens, execute harness logic, persist records, or trigger settlement.

### Suggested Panel Sections

| Section | Purpose | Example Display |
| --- | --- | --- |
| User Request | Shows the original user intent and requested amount. | `5,000,000 KRW` |
| Agent Decision | Shows the AI Agent's proposed action. | `50,000,000 KRW` |
| Deviation | Shows the mismatch between request and decision. | `900%` |
| AGAF Policy | Shows policy questions and enforcement mode. | `Q031, Q032, Q053 · BLOCK` |
| Decision Record | Shows the governance decision trace. | `DEC-KGLD-001` |
| Harness | Shows pre-execution enforcement result. | `BLOCK` |
| Token | Shows whether execution credentials are issued. | `NOT_ISSUED` |
| Execution | Shows final execution state. | `NOT_EXECUTED` |

## 3. Panel Data Mapping

The preview panel should map existing KGLD sample objects to read-only display fields.

| Sample Object | Panel Area | Display Fields |
| --- | --- | --- |
| `kgldRuntimePolicySample` | AGAF Policy | `policyId`, `sourceQuestionIds`, `actionTaxonomy`, `budgetLimit`, `approvalRequired`, `enforcementType`, `decisionRecordLevel`, `identityRequirement`, `contextRequirement` |
| `kgldRuntimeContextSample` | User Request / Agent Decision / Deviation | `contextId`, `userRequestAmount`, `agentDecisionAmount`, `deviationPercent`, `promptHash`, `ragHash`, `reputationScore`, `riskScore`, `timestamp` |
| `kgldDecisionRecordSample` | Decision Record / Token / Execution | `decisionId`, `policyId`, `sourceQuestionIds`, `agentId`, `agentRole`, `contextId`, `userRequestAmount`, `agentDecisionAmount`, `riskScore`, `enforcementAction`, `approvalState`, `tokenStatus`, `executionResult`, `auditCorrelationId`, `createdAt` |
| `kgldHarnessResultSample` | Harness / Execution | `enforcementAction`, `reason`, `sourceQuestionIds`, `policyId`, `decisionId`, `approvalState`, `executionAllowed`, `tokenStatus` |

### Recommended Display Mapping

| Panel Label | Source Object | Source Field | Demo Value |
| --- | --- | --- | --- |
| User Request | `kgldRuntimeContextSample` | `userRequestAmount` | `5,000,000 KRW` |
| Agent Decision | `kgldRuntimeContextSample` | `agentDecisionAmount` | `50,000,000 KRW` |
| Deviation | `kgldRuntimeContextSample` | `deviationPercent` | `900%` |
| Policy | `kgldRuntimePolicySample` | `sourceQuestionIds` | `Q031, Q032, Q053` |
| Enforcement | `kgldRuntimePolicySample` | `enforcementType` | `BLOCK` |
| Decision Record | `kgldDecisionRecordSample` | `decisionId` | `DEC-KGLD-001` |
| Harness Result | `kgldHarnessResultSample` | `enforcementAction` | `BLOCK` |
| Token Status | `kgldDecisionRecordSample` / `kgldHarnessResultSample` | `tokenStatus` | `NOT_ISSUED` |
| Execution | `kgldDecisionRecordSample` | `executionResult` | `NOT_EXECUTED` |

## 4. KGLD Scenario

The demo scenario must remain fixed as follows:

| Scenario Item | Value |
| --- | --- |
| User Request | `5,000,000 KRW` |
| Agent Decision | `50,000,000 KRW` |
| Deviation | `900%` |
| Policy | `Q031, Q032, Q053` |
| Harness Result | `BLOCK` |
| Token Status | `NOT_ISSUED` |
| Execution | `NOT_EXECUTED` |

### Scenario Interpretation

The AI Agent attempts to execute a KGLD action that is 10x larger than the user's original request. GovernOps detects the mismatch, evaluates the action against AGAF policy requirements, records the blocked decision state, prevents token issuance, and does not allow execution.

## 5. UX Copy

Suggested copy for the `GovernOps Runtime Preview` panel:

### Primary Message

> GovernOps detected that the AI Agent attempted to execute an action 10x larger than the original user request.

### Enforcement Message

> Execution was blocked before KGLD settlement.

### Chain Message

> No Decision Record → No Token → No Execution

### Supporting Messages

- `Original user request: 5,000,000 KRW`
- `Agent proposed action: 50,000,000 KRW`
- `Deviation detected: 900%`
- `Policy questions triggered: Q031, Q032, Q053`
- `Harness result: BLOCK`
- `Token status: NOT_ISSUED`
- `Execution status: NOT_EXECUTED`

### Empty or Neutral State Copy

If no scenario is selected yet:

> Select the KGLD GovernOps scenario to preview how GovernOps controls an AI Agent action before execution.

## 6. User Journey

1. User selects KGLD GovernOps scenario.
2. AI Agent proposes 50M KRW action from 5M KRW request.
3. GovernOps Preview shows policy, context, decision record, harness result.
4. Token is not issued.
5. Execution is not allowed.

### Journey Outcome

By the end of the flow, the user should understand that GovernOps is the pre-execution control layer that turns policy, runtime context, decision records, harness checks, and token state into an enforceable execution decision.

## 7. Future Implementation Notes

Future implementation may update the following files:

- `src/demo/kgld-vault-demo.html`
- `src/governops/sample-kgld.ts`

These files are intentionally not modified in this design-only step.

### Non-Goals for This Step

- Do not modify UI code.
- Do not modify `src/demo/kgld-vault-demo.html`.
- Do not modify `src/demo/demo.html`.
- Do not modify runtime code.
- Do not modify GovernOps TypeScript files.
- Do not connect APIs.
- Do not run harness execution.
- Do not issue tokens.
- Do not save decision records.
- Do not implement a policy compiler.
- Do not change dependencies.
- Do not modify build artifacts.
