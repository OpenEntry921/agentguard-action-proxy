# Behavior Pattern Taxonomy

## Core Philosophy

**AgentGuard should not only classify actions.**

**AgentGuard should classify behavior patterns.**

A single action can appear acceptable in isolation, while the sequence of actions reveals probing, bypass attempts, escalation, or exfiltration. Behavior Pattern Taxonomy gives AgentGuard a structure for detecting risk across time.

## Initial Taxonomy

### 1. Drift Pattern

- **Definition**: An AI agent receives approval for one action but attempts to execute a modified action.
- **Example**: Approved withdrawal amount is 500, but execution request changes it to 900.
- **Risk**: Approval integrity failure and unauthorized exposure.
- **Detection Signal**: Fingerprint mismatch between approved action and execution request.
- **Possible AgentGuard Response**: BLOCK and generate audit evidence.

### 2. Unauthorized Target Access Pattern

- **Definition**: An agent attempts to access a system, repository, account, device, or asset outside its approved boundary.
- **Example**: Agent approved for `repo-alpha` attempts to modify `repo-prod`.
- **Risk**: Lateral movement, unauthorized control, or data exposure.
- **Detection Signal**: Target system or resource does not match permission context.
- **Possible AgentGuard Response**: BLOCK, flag the agent profile, and notify reviewers.

### 3. Exposure Escalation Pattern

- **Definition**: An agent gradually increases monetary, data, compute, or operational exposure.
- **Example**: Multiple requests increase transfer amounts or cloud instance sizes over time.
- **Risk**: Cost blowout, financial loss, or expanded blast radius.
- **Detection Signal**: Rising cumulative exposure or sensitivity level across requests.
- **Possible AgentGuard Response**: REVIEW or BLOCK when thresholds are exceeded.

### 4. Repeated Retry / Bypass Pattern

- **Definition**: An agent repeatedly modifies and resubmits blocked or reviewed actions to find an allowed variant.
- **Example**: A blocked request for 10,000 is retried as 9,999, 9,500, and 9,000.
- **Risk**: Policy probing and automated bypass behavior.
- **Detection Signal**: Similar blocked requests with small parameter changes.
- **Possible AgentGuard Response**: BLOCK, rate-limit, and escalate for manual review.

### 5. Reconnaissance Pattern

- **Definition**: An agent enumerates systems, permissions, resources, or metadata without a clear approved task need.
- **Example**: Listing all repositories, secrets, roles, and deployment environments.
- **Risk**: Preparation for unauthorized access or data exfiltration.
- **Detection Signal**: High-volume read/list calls across sensitive namespaces.
- **Possible AgentGuard Response**: REVIEW, restrict scopes, and require task justification.

### 6. Privilege Escalation Pattern

- **Definition**: An agent attempts to increase its own privileges or grant elevated privileges to another identity.
- **Example**: Updating a role from viewer to admin.
- **Risk**: Loss of least privilege and persistent unauthorized authority.
- **Detection Signal**: Role, permission, scope, or credential modification action.
- **Possible AgentGuard Response**: BLOCK unless an explicit high-trust approval exists.

### 7. Data Exfiltration Pattern

- **Definition**: An agent attempts to move sensitive data outside approved boundaries.
- **Example**: Exporting customer records to an unapproved destination.
- **Risk**: Privacy breach, compliance incident, or intellectual property loss.
- **Detection Signal**: Sensitive resource access followed by export, download, or external transfer.
- **Possible AgentGuard Response**: BLOCK, require human review, and preserve evidence.

### 8. Tool Misuse Pattern

- **Definition**: An agent uses an approved tool for a purpose outside its intended governance context.
- **Example**: Using an issue tracker integration to store secrets or credentials.
- **Risk**: Control bypass through trusted tools.
- **Detection Signal**: Tool action, payload, or target inconsistent with tool purpose.
- **Possible AgentGuard Response**: REVIEW, sanitize payload, or BLOCK.

### 9. Delegation Abuse Pattern

- **Definition**: An agent delegates an action to another agent, workflow, or automation to avoid direct policy checks.
- **Example**: Triggering a CI workflow that performs a blocked infrastructure change.
- **Risk**: Indirect policy bypass and unclear accountability.
- **Detection Signal**: Agent-initiated handoff to automation with privileged downstream effects.
- **Possible AgentGuard Response**: Require downstream execution integrity checks and audit linkage.

### 10. Policy Boundary Testing Pattern

- **Definition**: An agent probes exact policy limits through repeated near-threshold requests.
- **Example**: Testing maximum transfer amount, maximum instance size, or allowed target list.
- **Risk**: Discovery of exploitable governance thresholds.
- **Detection Signal**: Sequential requests clustered around policy boundaries.
- **Possible AgentGuard Response**: REVIEW, adaptive threshold tightening, and behavior score reduction.
