# Execution Integrity

## Core Question

**Is the action approved for the AI agent the same action that gets executed?**

Execution Integrity is AgentGuard's core runtime verification capability. It prevents an approved action from silently drifting into a different, riskier, or unauthorized action during execution.

## Core Flow

```text
Approved Action
↓
Fingerprint
↓
Execution Request
↓
Fingerprint Comparison
↓
ALLOW / REVIEW / BLOCK
```

## Key Concepts

- **Action Fingerprint**: A canonical representation of the approved action, target, resource, parameters, and constraints.
- **Target Matching**: Verification that the execution target matches the approved target system.
- **Parameter Matching**: Verification that the executed parameters match approved values or approved ranges.
- **Resource Boundary**: Verification that the execution remains within the approved asset, account, repository, device, or environment.
- **Token Validation**: Verification that the execution uses a valid, unexpired, non-reused authorization token.
- **Drift Detection**: Detection of any mismatch between approval and execution.
- **Audit Evidence**: Persistent record of the approved action, execution request, comparison result, decision, and reason.

## Examples

### Financial

```text
Approved: Borrow 500 RLUSD
Executed: Borrow 900 RLUSD
Result: BLOCK
```

Reason: The executed amount exceeds the approved amount and changes financial exposure.

### GitHub

```text
Approved: Create PR
Executed: Delete Repository
Result: BLOCK
```

Reason: The executed action changes from a collaborative development action to a destructive administrative action.

### AWS

```text
Approved: Create t3.small
Executed: Create p5.48xlarge
Result: BLOCK
```

Reason: The executed instance type changes cost, compute power, and operational exposure.

### Harness Engineering

```text
Approved: Connector Change
Executed: Power Route Change
Result: BLOCK
```

Reason: The executed device or infrastructure operation affects a different safety boundary than the approved change.

## Why Execution Integrity Is a Differentiator

Approval systems decide whether a proposed action is acceptable. Execution Integrity verifies whether the final execution still matches that approved proposal.

For autonomous AI, this distinction is critical because agents can re-plan, tools can mutate requests, context can change, and integrations can translate actions incorrectly. AgentGuard treats the approval-to-execution gap as a governance risk.
