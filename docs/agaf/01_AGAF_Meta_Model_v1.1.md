# AGAF Meta Model v1.1

## Mission

AGAF (Agent Governance Assessment Framework) Meta Model v1.1 defines a documentation-first governance model for assessing agentic AI systems and mapping governance requirements into AgentGuard runtime governance concepts.

The mission of AGAF is to create a traceable bridge from governance standards to risk assessment, controls, policies, and runtime enforcement without changing any existing AgentGuard runtime, dashboard, demo, API, database, or dependency behavior.

## AGAF Design Principles

1. Assessment must map to Risk.
2. Risk must map to Controls.
3. Controls must map to Policies.
4. Policies must map to Runtime Enforcement.
5. Every Question must be traceable to Standards.
6. AGAF is designed to feed AgentGuard Runtime Governance.

## Governance Standards Layer

The Governance Standards Layer provides the standards-based source of truth for AGAF assessment questions, risk interpretation, control expectations, policy mapping, and runtime governance alignment.

### ISO/IEC 42001

ISO/IEC 42001 alignment focuses on AI management system governance and organizational accountability.

Required AGAF mappings include:

- A.5 AI Policy
- A.6 Internal Organization
- A.8 AI Lifecycle
- A.9 Impact Assessment
- A.10 Third Party

### NIST AI RMF

NIST AI RMF alignment focuses on lifecycle risk management through the core AI risk management functions.

Required AGAF mappings include:

- GOV
- MAP
- MEASURE
- MANAGE

### EU AI Act

EU AI Act alignment focuses on high-risk AI obligations and accountability mechanisms.

Required AGAF mappings include:

- Risk Management
- Data Governance
- Technical Documentation
- Logging & Traceability
- Transparency
- Human Oversight
- Accuracy & Robustness
- Cybersecurity

### Korea Financial AI Guideline

Korea Financial AI Guideline alignment focuses on responsible AI governance in financial services and regulated financial environments.

Required AGAF mappings include:

- Governance
- Legality
- Human-in-Control
- Trustworthiness
- Financial Stability
- Fiduciary Duty
- Security

---

## AGAF Risk Lifecycle

AGAF organizes governance evaluation into a risk lifecycle that connects assessment evidence to actionable control and policy outcomes.

1. Identify governance obligations from applicable standards.
2. Translate obligations into assessment questions.
3. Classify risk criticality based on business, operational, legal, security, and trust impact.
4. Define evidence required to substantiate governance posture.
5. Map risks to controls and control owners.
6. Map controls to policies and runtime governance expectations.
7. Determine whether AgentGuard runtime enforcement can support prevention, review, escalation, blocking, quarantine, or audit.
8. Preserve traceability across standards, questions, controls, policies, and runtime mappings.

---

## AGAF Domain Model

The AGAF Domain Model defines the major governance entities used to structure assessment and runtime alignment.

Core domains include:

- Standard: External or internal governance source such as ISO/IEC 42001, NIST AI RMF, EU AI Act, or Korea Financial AI Guideline.
- Question: Assessment prompt used to evaluate whether a governance requirement is addressed.
- Evidence: Documentation, configuration, process record, approval record, test result, log, or operational artifact required to support an answer.
- Risk: Potential negative outcome associated with insufficient governance, missing controls, weak policy, or unmanaged runtime behavior.
- Control: Governance or operational safeguard designed to reduce risk.
- Policy: Enforceable or reviewable rule derived from controls.
- Runtime Enforcement: AgentGuard-aligned enforcement capability such as allow, review, escalate, block, or quarantine.
- Mapping: Traceability link between standards, controls, policies, AgentGuard planes, and recommended rules.

---

## AgentGuard Plane Model

The AgentGuard Plane Model describes how AGAF concepts map into runtime governance surfaces.

- Identity Plane: Establishes who or what is acting, including agent identity, user identity, service identity, role, ownership, and authorization context.
- Trust Plane: Evaluates trust posture, confidence, provenance, reputation, model or agent trust state, and risk context.
- Control Plane: Applies governance controls, policy decisions, routing rules, review requirements, and enforcement configuration.
- Override Plane: Manages exception paths, approvals, break-glass decisions, compensating controls, and human authorization for non-standard actions.
- Audit Plane: Captures logs, evidence, traceability, decisions, enforcement outcomes, and accountability records.

---

## Policy Library

The Policy Library is the structured collection of governance policies derived from AGAF controls.

Policy entries should preserve traceability to:

- Governance standards
- Assessment questions
- Risk criticality
- Required evidence
- Control mappings
- AgentGuard plane mappings
- Runtime enforcement capabilities
- Recommended rules

The Policy Library remains a documentation artifact in AGAF Meta Model v1.1 and does not introduce implementation changes.

---

## Runtime Enforcement Model

The Runtime Enforcement Model defines the conceptual enforcement outcomes that AGAF policies may map to in AgentGuard runtime governance.

- ALLOW: Permit the action when risk is acceptable and required controls are satisfied.
- REVIEW: Require additional inspection, validation, or human review before completion.
- ESCALATE: Route the action or decision to an accountable authority, governance owner, or higher approval level.
- BLOCK: Prevent the action when risk is unacceptable, policy is violated, or required evidence is missing.
- QUARANTINE: Isolate the action, output, artifact, session, or agent behavior pending investigation, remediation, or governance disposition.

---

## Context Engineering vs Harness Engineering

AGAF distinguishes between Context Engineering and Harness Engineering to clarify where governance is applied.

Context Engineering focuses on the information environment supplied to an AI agent, including prompts, instructions, memory, retrieved content, business context, tool descriptions, and policy context.

Harness Engineering focuses on the execution environment around an AI agent, including identity, permissions, tool access, policy enforcement, monitoring, logging, review flows, escalation, blocking, quarantine, and auditability.

AGAF treats both as necessary governance surfaces:

- Context Engineering influences what the agent understands and how it reasons.
- Harness Engineering governs what the agent can do and how runtime behavior is controlled.

---

## Metadata Standard

The AGAF Metadata Standard defines the minimum required columns for assessment questions and mappings.

| Column | Description |
| --- | --- |
| Question ID | Unique identifier for the AGAF assessment question. |
| Question | The assessment question used to evaluate governance posture. |
| Why This Matters | Explanation of the governance, operational, legal, security, or trust importance of the question. |
| Evidence Required | Required artifact, document, record, log, policy, configuration, or other proof needed to support the assessment. |
| Risk Criticality | Risk level or severity associated with the question if the control is missing or ineffective. |
| AgentGuard Relevance | Explanation of how the question relates to AgentGuard governance objectives. |
| Runtime Enforcement Capability | Applicable runtime enforcement outcome or capability, such as ALLOW, REVIEW, ESCALATE, BLOCK, or QUARANTINE. |
| Control Mapping | Mapping to the governance or operational control that addresses the assessed risk. |
| Policy Mapping | Mapping to the policy requirement derived from the control. |
| AgentGuard Mapping | Mapping to AgentGuard planes, runtime concepts, or governance surfaces. |
| Recommended Rule | Suggested policy or runtime governance rule that could be considered for future implementation. |

---

## Business Conversion Layer

The Business Conversion Layer translates AGAF assessment results into business-facing governance outputs.

Outputs may include:

- Executive governance summaries
- Risk heatmaps
- Control gap analysis
- Policy readiness indicators
- Evidence completeness status
- AgentGuard runtime governance readiness
- Compliance alignment summaries
- Audit preparation artifacts
- Remediation priorities
- Business owner action lists

The purpose of this layer is to make AGAF results actionable for governance, risk, compliance, product, security, legal, and executive stakeholders while preserving full traceability back to standards and runtime governance mappings.
