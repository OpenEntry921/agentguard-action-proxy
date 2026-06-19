# AGAF Standards Crosswalk

## Purpose

This document defines the standards-to-AGAF crosswalk for AGAF without changing the existing AGAF assessment question set, scoring model, policy library, AgentGuard plane model, runtime concepts, code, database, or dependencies.

The direction of interpretation is strictly:

```text
External standard requirement area -> AGAF domain mapping
```

This document must not be used to force external standards into preselected AGAF outcomes. Mapping decisions are based only on the governance intent of the referenced standard areas.

## Scope Guardrails

The following items are intentionally out of scope for this document:

- No modification, addition, deletion, or reordering of the existing D01-D25 domains or Q001-Q250 questions.
- No modification of the existing scoring dimensions: Risk Criticality, AgentGuard Relevance, and Runtime Capability.
- No addition or redesign of policies.
- No addition or redesign of AgentGuard planes.
- No AgentGuard product, runtime, API, dashboard, workflow, MCP, OAuth, DID, wallet, or XRPL feature design.
- No SaaS, billing, subscription, user-management, enterprise-management, or report-generation design.
- No code, database, dependency, build, package, or runtime change.

## Mapping Method

Each crosswalk row follows a standards-first interpretation method:

1. Identify the external standard requirement area.
2. Interpret the governance obligation or control intent.
3. Map that obligation to the most relevant existing AGAF domain or domains.
4. Record the mapping rationale without creating new AGAF questions, domains, planes, policies, controls, or runtime capabilities.

Where a standard requirement spans multiple governance concerns, multiple AGAF domains may be listed. Multiple mappings indicate coverage overlap, not duplicate requirements and not new question generation.

---

## Section 1: ISO/IEC 42001 Crosswalk

ISO/IEC 42001 alignment focuses on AI management-system governance, accountability, lifecycle control, impact assessment, and third-party relationships.

| ISO/IEC 42001 Area | Governance Intent | AGAF Domain Mapping | Mapping Rationale |
| --- | --- | --- | --- |
| A.5 AI Policy | Establish, communicate, maintain, and review organizational AI policy expectations. | D25 Strategic Governance | AI policy is an enterprise governance obligation and therefore maps to strategic governance rather than to a new policy or runtime design area. |
| A.6 Internal Organization | Define responsibilities, authorities, organizational roles, and accountability for AI management. | D01 Organizational Accountability; D25 Strategic Governance | Internal organization requirements map to accountability ownership and strategic oversight. |
| A.7 Resources for AI Systems | Ensure appropriate resources, competence, tooling, data, infrastructure, and supporting assets for AI systems. | D04 Operational Readiness; D17 Model Governance | Resource readiness supports operational capability and model governance without changing AGAF scoring or runtime capability definitions. |
| A.8 AI System Lifecycle | Govern AI system lifecycle stages from design through operation, monitoring, maintenance, and retirement. | D17 Model Governance; D20 Lifecycle Management | Lifecycle controls map to model governance and lifecycle management. |
| A.9 Impact Assessment | Assess AI system impacts on individuals, organizations, society, legal obligations, and operational risk. | D14 Impact Assessment; D15 Trustworthiness | Impact assessment maps to impact identification and trustworthy AI evaluation. |
| A.10 Third Party and Customer Relationships | Govern suppliers, customers, outsourced services, and third-party AI dependencies. | D18 Supply Chain; D19 Third Party Agents | Third-party relationship controls map to supply-chain governance and third-party agent governance. |

---

## Section 2: NIST AI RMF Crosswalk

NIST AI RMF alignment focuses on lifecycle risk management through the core functions Govern, Map, Measure, and Manage.

| NIST AI RMF Function | Governance Intent | AGAF Domain Mapping | Mapping Rationale |
| --- | --- | --- | --- |
| GOV | Establish organizational AI risk governance, accountability, policies, roles, culture, oversight, and risk tolerance. | D01 Organizational Accountability; D25 Strategic Governance | GOV maps to accountability and strategic governance because it defines the management system for AI risk. |
| MAP | Establish context, categorize AI systems, identify stakeholders, intended use, impacts, dependencies, and risk context. | D14 Impact Assessment; D15 Trustworthiness; D18 Supply Chain | MAP maps to impact assessment, trustworthiness context, and dependency identification. |
| MEASURE | Analyze, assess, test, monitor, benchmark, and document AI risks and trustworthy characteristics. | D21 Monitoring and Logging; D22 Evaluation and Testing | MEASURE maps to monitoring, evidence capture, evaluation, and testing activities. |
| MANAGE | Prioritize, respond to, mitigate, accept, transfer, or communicate AI risks across lifecycle operations. | D03 Risk Management; D06 Human Oversight; D23 Legal and Compliance | MANAGE maps to risk treatment, human oversight for risk decisions, and legal or compliance handling. |

---

## Section 3: EU AI Act Crosswalk

EU AI Act alignment focuses on high-risk AI obligations, accountability, transparency, technical documentation, human oversight, logging, robustness, and cybersecurity.

| EU AI Act Requirement Area | Governance Intent | AGAF Domain Mapping | Mapping Rationale |
| --- | --- | --- | --- |
| Risk Management | Establish and maintain a risk management system for high-risk AI systems. | D03 Risk Management; D25 Strategic Governance | Risk management obligations map to operational risk treatment and strategic oversight. |
| Data Governance | Govern data quality, relevance, representativeness, bias-related controls, and data management practices. | D12 Data Governance; D15 Trustworthiness | Data governance requirements map to data controls and trustworthy AI characteristics. |
| Technical Documentation | Maintain documentation sufficient to demonstrate compliance, design intent, system characteristics, and control evidence. | D13 Documentation and Evidence; D23 Legal and Compliance | Technical documentation maps to evidence management and compliance demonstration. |
| Logging and Traceability | Enable logs, records, traceability, and post-event review for relevant AI system operation. | D21 Monitoring and Logging; D24 Auditability | Logging requirements map to monitoring, traceability, and audit readiness. |
| Transparency | Provide information enabling appropriate understanding, use, limitations, and accountability. | D09 Transparency; D13 Documentation and Evidence | Transparency maps to user-facing and governance-facing explainability and documentation evidence. |
| Human Oversight | Ensure effective human oversight and intervention capability for high-risk AI systems. | D06 Human Oversight | Human oversight maps directly to the existing AGAF human oversight domain. |
| Accuracy and Robustness | Ensure appropriate performance, resilience, reliability, and robustness across expected operating conditions. | D16 Security and Robustness; D22 Evaluation and Testing | Accuracy and robustness map to security and robustness controls plus evaluation and testing. |
| Cybersecurity | Protect high-risk AI systems from cybersecurity threats, manipulation, and resilience failures. | D16 Security and Robustness | Cybersecurity maps to the existing security and robustness domain. |

---

## Section 4: Korea Financial AI Guideline Crosswalk

Korea Financial AI Guideline alignment focuses on responsible AI governance in financial services, including legality, human control, trustworthiness, financial stability, fiduciary duties, and security.

| Financial AI Guideline Area | Governance Intent | AGAF Domain Mapping | Mapping Rationale |
| --- | --- | --- | --- |
| Governance | Establish accountable AI governance for financial institutions and AI use in regulated financial environments. | D01 Organizational Accountability; D25 Strategic Governance | Financial-sector governance maps to accountability and strategic governance. |
| Legality | Ensure AI use complies with applicable financial, privacy, consumer-protection, and regulatory obligations. | D23 Legal and Compliance | Legality maps directly to legal and compliance governance. |
| Human-in-Control | Preserve meaningful human control, review, intervention, and responsibility over AI-assisted financial decisions. | D06 Human Oversight | Human-in-Control maps directly to human oversight. |
| Trustworthiness | Promote reliability, fairness, transparency, explainability, and responsible use of AI in financial contexts. | D09 Transparency; D15 Trustworthiness; D22 Evaluation and Testing | Trustworthiness maps to transparency, trust characteristics, and evaluation evidence. |
| Financial Stability | Consider systemic, operational, market, model, and concentration risks that may affect financial stability. | D03 Risk Management; D14 Impact Assessment | Financial-stability concerns map to risk management and impact assessment. |
| Fiduciary Duty | Protect customer interests, prevent conflicts of interest, and ensure responsible use of AI in financial advice or decisions. | D07 Customer Protection; D23 Legal and Compliance | Fiduciary duties map to customer protection and compliance obligations. |
| Security | Protect AI systems, financial data, operating environments, and dependent services from security threats. | D16 Security and Robustness; D18 Supply Chain | Security maps to AI system security and supply-chain dependency governance. |

---

## Completion Confirmation

This document completes only the standards crosswalk definition step.

| Completion Item | Status |
| --- | --- |
| `02_AGAF_Standards_Crosswalk.md` created | Complete |
| ISO/IEC 42001 mapping defined | Complete |
| NIST AI RMF mapping defined | Complete |
| EU AI Act mapping defined | Complete |
| Korea Financial AI Guideline mapping defined | Complete |
| Existing 250 questions modified | Not modified |
| Existing code modified | Not modified |
| Existing database modified | Not modified |
| Dependencies added | None |
| AgentGuard feature/runtime behavior modified | Not modified |
