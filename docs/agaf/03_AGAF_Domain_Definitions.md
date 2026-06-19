# AGAF Domain Definitions

## Purpose

This document freezes the AGAF domain architecture for the fixed set of 25 domains. It defines each domain's purpose, scope, excluded scope, standards alignment, plane alignment, policy alignment, and representative example question links without modifying Q001-Q250, adding domains, deleting domains, renaming domains, changing the meta model, changing the standards crosswalk, changing AgentGuard implementation design, changing SaaS design, changing code, or adding dependencies.

## AGAF Domain Master List

- D01 Agent Identity
- D02 Agent Trust
- D03 Runtime Decision Control
- D04 Financial Actions
- D05 Infrastructure Changes
- D06 Human Override
- D07 Delegation
- D08 AI Risk Management
- D09 Tool Usage
- D10 External API
- D11 Data Access
- D12 Data Leakage
- D13 Privacy
- D14 Knowledge Sources
- D15 Hallucination
- D16 Prompt Security
- D17 Model Governance
- D18 Supply Chain
- D19 Third Party Agents
- D20 Multi-Agent Governance
- D21 Auditability
- D22 Explainability
- D23 Compliance
- D24 Business Continuity
- D25 Strategic Governance

## Domain Definitions

### D01 Agent Identity

**Purpose**

Agent의 신원, 소유자, 역할, 책임추적을 보장한다.

**Scope**

- Agent ID
- Credential
- Ownership
- Role
- Lifecycle
- Identity binding
- Accountable owner linkage

**Excluded**

- Prompt Security
- Audit evidence retention
- Regulatory compliance interpretation
- Third-party supplier assurance

**Related Standards**

- ISO/IEC 42001 A.6 Internal Organization
- ISO/IEC 42001 A.8 AI System Lifecycle
- NIST AI RMF GOV
- EU AI Act Technical Documentation
- Korea Financial AI Guideline Governance

**Related Plane**

- Identity Plane

**Related Policies**

- Identity Policy
- Credential Policy
- Ownership Policy
- Lifecycle Policy

**Example Questions**

- Q001
- Q002
- Q003

### D02 Agent Trust

**Purpose**

Agent가 신뢰 가능한 상태인지, 신뢰 근거가 무엇인지, 신뢰 수준이 변화할 때 어떤 통제가 필요한지를 정의한다.

**Scope**

- Trust posture
- Reputation signal
- Confidence level
- Provenance of agent behavior
- Trust degradation
- Trust recovery condition

**Excluded**

- Legal compliance determination
- Explainability narrative
- Supplier contract review
- Business continuity planning

**Related Standards**

- ISO/IEC 42001 A.9 Impact Assessment
- NIST AI RMF MAP
- NIST AI RMF MEASURE
- EU AI Act Accuracy & Robustness
- Korea Financial AI Guideline Trustworthiness

**Related Plane**

- Trust Plane

**Related Policies**

- Trust Policy
- Reputation Policy
- Confidence Threshold Policy
- Trust Degradation Policy

**Example Questions**

- Q011
- Q012
- Q013

### D03 Runtime Decision Control

**Purpose**

Agent 실행 중 의사결정이 허용, 검토, 에스컬레이션, 차단, 격리 중 어느 통제 상태에 해당하는지 판단할 수 있게 한다.

**Scope**

- Runtime decision boundary
- Approval threshold
- Escalation criteria
- Action blocking condition
- Quarantine condition
- Decision accountability

**Excluded**

- Human override exception ownership
- Model lifecycle governance
- External API contract assurance
- Audit log retention period

**Related Standards**

- ISO/IEC 42001 A.5 AI Policy
- NIST AI RMF MANAGE
- EU AI Act Risk Management
- EU AI Act Human Oversight
- Korea Financial AI Guideline Human-in-Control

**Related Plane**

- Control Plane

**Related Policies**

- Runtime Decision Policy
- Approval Threshold Policy
- Escalation Policy
- Blocking Policy
- Quarantine Policy

**Example Questions**

- Q021
- Q022
- Q023

### D04 Financial Actions

**Purpose**

금융 거래, 자금 이동, 금융 의사결정, 고객 자산 영향 행동에 대한 통제 책임과 허용 범위를 확정한다.

**Scope**

- Payment or transfer action
- Trading or investment action
- Financial advice action
- Customer asset impact
- Fiduciary obligation trigger
- Financial loss prevention

**Excluded**

- General identity management
- Generic tool invocation
- Infrastructure deployment
- Prompt injection control

**Related Standards**

- ISO/IEC 42001 A.9 Impact Assessment
- NIST AI RMF MAP
- NIST AI RMF MANAGE
- EU AI Act Risk Management
- Korea Financial AI Guideline Financial Stability
- Korea Financial AI Guideline Fiduciary Duty

**Related Plane**

- Control Plane
- Override Plane
- Audit Plane

**Related Policies**

- Financial Action Policy
- Transaction Approval Policy
- Fiduciary Duty Policy
- Financial Stability Policy

**Example Questions**

- Q031
- Q032
- Q033

### D05 Infrastructure Changes

**Purpose**

Agent가 시스템, 배포, 설정, 네트워크, 운영환경에 영향을 주는 변경을 수행할 때 변경 위험과 승인 필요성을 통제한다.

**Scope**

- Deployment change
- Configuration change
- Network or environment modification
- System availability impact
- Privileged infrastructure operation
- Rollback requirement

**Excluded**

- Data privacy obligations
- Knowledge source quality
- Hallucination assessment
- Strategic governance charter

**Related Standards**

- ISO/IEC 42001 A.7 Resources for AI Systems
- ISO/IEC 42001 A.8 AI System Lifecycle
- NIST AI RMF MANAGE
- EU AI Act Cybersecurity
- EU AI Act Accuracy & Robustness
- Korea Financial AI Guideline Security

**Related Plane**

- Control Plane
- Override Plane
- Audit Plane

**Related Policies**

- Infrastructure Change Policy
- Privileged Action Policy
- Change Approval Policy
- Rollback Policy

**Example Questions**

- Q041
- Q042
- Q043

### D06 Human Override

**Purpose**

사람이 Agent 결정을 중단, 대체, 승인, 거부, 예외처리할 수 있는 권한과 책임 경계를 보장한다.

**Scope**

- Human intervention
- Break-glass authority
- Manual approval
- Exception handling
- Override accountability
- Compensating control
- Human Review Trigger
- Human Confirmation Trigger
- Human Stop Authority
- Human Recovery Authority
- Human Escalation Trigger

**Excluded**

- Agent credential issuance
- Third-party onboarding
- Knowledge retrieval source ranking
- General compliance reporting

**Related Standards**

- ISO/IEC 42001 A.6 Internal Organization
- NIST AI RMF GOV
- NIST AI RMF MANAGE
- EU AI Act Human Oversight
- Korea Financial AI Guideline Human-in-Control

**Related Plane**

- Override Plane
- Control Plane
- Audit Plane

**Related Policies**

- Human Override Policy
- Break-Glass Policy
- Exception Approval Policy
- Compensating Control Policy
- Human Review Policy
- Human Stop Policy
- Human Recovery Policy

**Example Questions**

- Q051
- Q052
- Q053

### D07 Delegation

**Purpose**

Agent가 권한, 작업, 의사결정, 실행 책임을 다른 Agent, 시스템, 사람에게 위임할 때 위임 범위와 책임 연쇄를 통제한다.

**Scope**

- Delegated authority
- Sub-task assignment
- Responsibility chain
- Delegation limit
- Revocation condition
- Downstream accountability

**Excluded**

- Multi-agent collective governance
- Third-party agent assurance
- Supply-chain dependency management
- Financial action-specific approvals

**Related Standards**

- ISO/IEC 42001 A.6 Internal Organization
- ISO/IEC 42001 A.8 AI System Lifecycle
- NIST AI RMF GOV
- NIST AI RMF MANAGE
- EU AI Act Human Oversight
- Korea Financial AI Guideline Governance

**Related Plane**

- Identity Plane
- Control Plane
- Audit Plane

**Related Policies**

- Delegation Policy
- Authority Boundary Policy
- Responsibility Chain Policy
- Delegation Revocation Policy

**Example Questions**

- Q061
- Q062
- Q063

### D08 AI Risk Management

**Purpose**

AI 사용으로 발생하는 위험을 식별, 평가, 우선순위화, 처리, 수용, 이전, 모니터링하기 위한 독립적인 위험관리 책임 영역을 확정한다.

**Scope**

- AI risk identification
- Risk assessment
- Risk treatment
- Risk acceptance
- Risk escalation
- Residual risk
- Risk ownership
- Risk Register
- Risk Classification
- Residual Risk Scoring
- High Impact AI Assessment
- Risk Acceptance Authority
- Risk Treatment Tracking

**Excluded**

- Compliance evidence filing
- Audit log mechanics
- Prompt attack controls
- Business continuity recovery planning

**Related Standards**

- ISO/IEC 42001 A.5 AI Policy
- ISO/IEC 42001 A.9 Impact Assessment
- NIST AI RMF GOV
- NIST AI RMF MAP
- NIST AI RMF MEASURE
- NIST AI RMF MANAGE
- EU AI Act Risk Management
- Korea Financial AI Guideline Financial Stability

**Related Plane**

- Trust Plane
- Control Plane
- Override Plane
- Audit Plane

**Related Policies**

- AI Risk Management Policy
- Risk Acceptance Policy
- Risk Escalation Policy
- Residual Risk Policy
- Risk Register Policy
- Risk Classification Policy
- High Impact AI Policy

**Example Questions**

- Q071
- Q072
- Q073

### D09 Tool Usage

**Purpose**

Agent가 도구를 사용할 때 도구 목적, 허용 범위, 위험도, 실행 전후 검증, 오남용 방지를 통제한다.

**Scope**

- Tool invocation
- Tool permission
- Tool risk classification
- Tool output validation
- Tool misuse prevention
- Tool usage traceability

**Excluded**

- External API provider governance
- Data access classification
- Prompt security attack handling
- Model lifecycle approval

**Related Standards**

- ISO/IEC 42001 A.8 AI System Lifecycle
- NIST AI RMF MAP
- NIST AI RMF MANAGE
- EU AI Act Logging & Traceability
- EU AI Act Cybersecurity
- Korea Financial AI Guideline Security

**Related Plane**

- Control Plane
- Audit Plane

**Related Policies**

- Tool Usage Policy
- Tool Permission Policy
- Tool Validation Policy
- Tool Misuse Policy

**Example Questions**

- Q081
- Q082
- Q083

### D10 External API

**Purpose**

Agent가 외부 API를 호출하거나 외부 서비스 결과를 사용할 때 신뢰, 계약, 보안, 데이터 전송, 장애 영향을 통제한다.

**Scope**

- External API call
- API authentication context
- API data exchange
- API failure handling
- API trust boundary
- API dependency risk

**Excluded**

- General third-party agent behavior
- Internal model governance
- Human override authority
- Strategic governance charter

**Related Standards**

- ISO/IEC 42001 A.10 Third Party and Customer Relationships
- NIST AI RMF MAP
- NIST AI RMF MANAGE
- EU AI Act Cybersecurity
- EU AI Act Technical Documentation
- Korea Financial AI Guideline Security

**Related Plane**

- Trust Plane
- Control Plane
- Audit Plane

**Related Policies**

- External API Policy
- API Trust Boundary Policy
- API Data Exchange Policy
- API Failure Policy

**Example Questions**

- Q091
- Q092
- Q093

### D11 Data Access

**Purpose**

Agent가 데이터에 접근, 조회, 검색, 사용, 결합할 때 최소권한과 목적 제한을 보장한다.

**Scope**

- Data permission
- Data classification
- Access purpose
- Least privilege
- Data retrieval
- Data use boundary

**Excluded**

- Data leakage incident handling
- Privacy law interpretation
- Knowledge source credibility
- Audit evidence retention

**Related Standards**

- ISO/IEC 42001 A.7 Resources for AI Systems
- NIST AI RMF MAP
- EU AI Act Data Governance
- EU AI Act Cybersecurity
- Korea Financial AI Guideline Legality
- Korea Financial AI Guideline Security

**Related Plane**

- Identity Plane
- Control Plane
- Audit Plane

**Related Policies**

- Data Access Policy
- Data Classification Policy
- Least Privilege Policy
- Purpose Limitation Policy

**Example Questions**

- Q101
- Q102
- Q103

### D12 Data Leakage

**Purpose**

Agent가 민감정보, 기밀정보, 내부정보, 고객정보를 외부 또는 부적절한 대상에게 노출하지 않도록 통제한다.

**Scope**

- Sensitive data exposure
- Confidential data exfiltration
- Output leakage
- Cross-context disclosure
- Data minimization for outputs
- Leakage detection trigger

**Excluded**

- Lawful privacy basis assessment
- Data source quality assessment
- Prompt injection prevention as a primary topic
- Business continuity planning

**Related Standards**

- ISO/IEC 42001 A.8 AI System Lifecycle
- NIST AI RMF MANAGE
- EU AI Act Data Governance
- EU AI Act Cybersecurity
- Korea Financial AI Guideline Legality
- Korea Financial AI Guideline Security

**Related Plane**

- Control Plane
- Audit Plane

**Related Policies**

- Data Leakage Policy
- Sensitive Output Policy
- Data Minimization Policy
- Exfiltration Prevention Policy

**Example Questions**

- Q111
- Q112
- Q113

### D13 Privacy

**Purpose**

개인정보와 프라이버시 영향을 수반하는 Agent 처리에 대해 적법성, 목적 제한, 최소화, 보존, 정보주체 권리를 보장한다.

**Scope**

- Personal data processing
- Privacy impact
- Consent or lawful basis
- Data subject rights
- Retention limitation
- Privacy-by-design evidence

**Excluded**

- Generic data access permissions
- Non-personal confidential leakage
- Model performance testing
- Supply-chain assurance

**Related Standards**

- ISO/IEC 42001 A.9 Impact Assessment
- NIST AI RMF MAP
- NIST AI RMF MANAGE
- EU AI Act Data Governance
- EU AI Act Transparency
- Korea Financial AI Guideline Legality

**Related Plane**

- Control Plane
- Audit Plane

**Related Policies**

- Privacy Policy
- Lawful Basis Policy
- Retention Policy
- Data Subject Rights Policy

**Example Questions**

- Q121
- Q122
- Q123

### D14 Knowledge Sources

**Purpose**

Agent가 참조하는 지식, 문서, 검색 결과, 기억, 컨텍스트 출처의 신뢰성, 최신성, 권한, 출처추적을 보장한다.

**Scope**

- Source provenance
- Source credibility
- Retrieval boundary
- Knowledge freshness
- Source authorization
- Context relevance
- Citation or attribution requirement

**Excluded**

- Hallucinated output behavior itself
- Prompt injection as a primary attack class
- Model lifecycle approval
- Regulatory compliance filing

**Related Standards**

- ISO/IEC 42001 A.7 Resources for AI Systems
- ISO/IEC 42001 A.9 Impact Assessment
- NIST AI RMF MAP
- NIST AI RMF MEASURE
- EU AI Act Data Governance
- EU AI Act Transparency
- Korea Financial AI Guideline Trustworthiness

**Related Plane**

- Trust Plane
- Control Plane
- Audit Plane

**Related Policies**

- Knowledge Source Policy
- Source Provenance Policy
- Retrieval Boundary Policy
- Source Freshness Policy

**Example Questions**

- Q141
- Q147
- Q148

### D15 Hallucination

**Purpose**

Agent가 근거 없는 주장, 허위 사실, 불확실성 은폐, 과도한 확신을 생성하지 않도록 검증과 제한 기준을 정의한다.

**Scope**

- Unsupported claim
- Factuality validation
- Uncertainty disclosure
- Confidence calibration
- Answer refusal condition
- Claim verification requirement

**Excluded**

- Source governance before generation
- Prompt injection prevention
- Formal regulatory compliance conclusion
- Audit record retention

**Related Standards**

- ISO/IEC 42001 A.9 Impact Assessment
- NIST AI RMF MEASURE
- NIST AI RMF MANAGE
- EU AI Act Accuracy & Robustness
- EU AI Act Transparency
- Korea Financial AI Guideline Trustworthiness

**Related Plane**

- Trust Plane
- Control Plane
- Audit Plane

**Related Policies**

- Hallucination Control Policy
- Factuality Policy
- Uncertainty Disclosure Policy
- Claim Verification Policy

**Example Questions**

- Q151
- Q152
- Q153

### D16 Prompt Security

**Purpose**

Prompt injection, instruction override, malicious context, jailbreak, tool-trigger manipulation으로부터 Agent의 지시체계와 실행결정을 보호한다.

**Scope**

- Prompt injection
- Jailbreak attempt
- Instruction hierarchy violation
- Malicious context
- Tool-trigger manipulation
- Prompt-origin trust

**Excluded**

- General hallucination quality
- Knowledge source freshness
- Supply-chain contract review
- Business continuity recovery

**Related Standards**

- ISO/IEC 42001 A.8 AI System Lifecycle
- NIST AI RMF MAP
- NIST AI RMF MANAGE
- EU AI Act Cybersecurity
- EU AI Act Accuracy & Robustness
- Korea Financial AI Guideline Security

**Related Plane**

- Trust Plane
- Control Plane
- Audit Plane

**Related Policies**

- Prompt Security Policy
- Instruction Hierarchy Policy
- Prompt Injection Policy
- Malicious Context Policy

**Example Questions**

- Q161
- Q162
- Q163

### D17 Model Governance

**Purpose**

모델의 선정, 승인, 변경, 성능, 한계, 버전, 수명주기 책임을 관리한다.

**Scope**

- Model approval
- Model version
- Model limitation
- Model evaluation evidence
- Model change control
- Model retirement
- Foundation Model Registry
- Approved Model Registry
- Shadow Model Detection
- Fine-Tuning Governance
- Model Risk Classification
- Model Retirement Approval

**Excluded**

- Agent identity credentials
- Runtime financial transaction approval
- Third-party agent operational behavior
- Business continuity response

**Related Standards**

- ISO/IEC 42001 A.7 Resources for AI Systems
- ISO/IEC 42001 A.8 AI System Lifecycle
- NIST AI RMF MEASURE
- EU AI Act Technical Documentation
- EU AI Act Accuracy & Robustness
- Korea Financial AI Guideline Trustworthiness

**Related Plane**

- Trust Plane
- Control Plane
- Audit Plane

**Related Policies**

- Model Governance Policy
- Model Approval Policy
- Model Change Policy
- Model Evaluation Policy
- Model Registry Policy
- Approved Model Policy
- Shadow Model Policy
- Fine-Tuning Policy

**Example Questions**

- Q171
- Q172
- Q173

### D18 Supply Chain

**Purpose**

모델, 데이터, 도구, 라이브러리, 서비스, 인프라 등 Agent 운영에 영향을 주는 공급망 구성요소의 출처, 무결성, 보안, 의존성 위험을 관리한다.

**Scope**

- Supplier component
- Dependency provenance
- Component integrity
- Vulnerability exposure
- Service dependency
- Supplier risk
- Change notification

**Excluded**

- Independent third-party agent conduct
- Internal multi-agent coordination
- End-user privacy rights
- Explainability communication

**Related Standards**

- ISO/IEC 42001 A.10 Third Party and Customer Relationships
- NIST AI RMF MAP
- NIST AI RMF MANAGE
- EU AI Act Cybersecurity
- EU AI Act Technical Documentation
- Korea Financial AI Guideline Security

**Related Plane**

- Trust Plane
- Control Plane
- Audit Plane

**Related Policies**

- Supply Chain Policy
- Dependency Provenance Policy
- Supplier Risk Policy
- Component Integrity Policy

**Example Questions**

- Q181
- Q182
- Q183

### D19 Third Party Agents

**Purpose**

외부 조직, 파트너, 고객, 벤더가 소유하거나 운영하는 Agent와 상호작용할 때 신뢰, 책임, 권한, 행위 경계를 관리한다.

**Scope**

- External agent identity
- Third-party agent authorization
- Third-party agent behavior
- Partner-owned agent accountability
- Cross-organization agent interaction
- Third-party agent revocation

**Excluded**

- Non-agent supply-chain components
- Internal delegation between owned agents
- General external API dependency
- Model version governance

**Related Standards**

- ISO/IEC 42001 A.10 Third Party and Customer Relationships
- NIST AI RMF MAP
- NIST AI RMF MANAGE
- EU AI Act Transparency
- EU AI Act Logging & Traceability
- Korea Financial AI Guideline Governance
- Korea Financial AI Guideline Security

**Related Plane**

- Identity Plane
- Trust Plane
- Control Plane
- Audit Plane

**Related Policies**

- Third Party Agent Policy
- External Agent Trust Policy
- Partner Agent Authorization Policy
- Third Party Agent Revocation Policy

**Example Questions**

- Q191
- Q192
- Q193

### D20 Multi-Agent Governance

**Purpose**

여러 Agent가 협업, 경쟁, 위임, 합의, 충돌 해결을 수행할 때 전체 시스템 수준의 책임과 통제 경계를 보장한다.

**Scope**

- Multi-agent coordination
- Agent-to-agent interaction
- Consensus or conflict resolution
- Collective action boundary
- Emergent behavior monitoring
- Shared responsibility model

**Excluded**

- Single-agent identity registration
- Third-party agent onboarding alone
- Non-agent supply-chain dependency
- Individual model approval

**Related Standards**

- ISO/IEC 42001 A.6 Internal Organization
- ISO/IEC 42001 A.8 AI System Lifecycle
- NIST AI RMF GOV
- NIST AI RMF MAP
- NIST AI RMF MANAGE
- EU AI Act Risk Management
- Korea Financial AI Guideline Governance

**Related Plane**

- Identity Plane
- Trust Plane
- Control Plane
- Audit Plane

**Related Policies**

- Multi-Agent Governance Policy
- Agent Coordination Policy
- Collective Action Policy
- Emergent Behavior Policy

**Example Questions**

- Q201
- Q202
- Q203

### D21 Auditability

**Purpose**

Agent 관련 결정, 입력, 출력, 실행, 승인, 예외, 통제결과를 사후 검토 가능한 증거로 남기고 추적 가능하게 한다.

**Scope**

- Audit log
- Decision trace
- Evidence record
- Event chronology
- Control outcome record
- Reviewability
- Accountability trail

**Excluded**

- Compliance obligation interpretation
- Explainability to users
- Business continuity recovery strategy
- Strategic governance ownership

**Related Standards**

- ISO/IEC 42001 A.8 AI System Lifecycle
- ISO/IEC 42001 A.9 Impact Assessment
- NIST AI RMF MEASURE
- EU AI Act Logging & Traceability
- EU AI Act Technical Documentation
- Korea Financial AI Guideline Governance

**Related Plane**

- Audit Plane

**Related Policies**

- Auditability Policy
- Logging Policy
- Evidence Retention Policy
- Traceability Policy

**Example Questions**

- Q211
- Q212
- Q213

### D22 Explainability

**Purpose**

Agent 결정과 결과에 대해 이해 가능한 이유, 근거, 한계, 영향 설명을 제공할 수 있도록 한다.

**Scope**

- Decision explanation
- Rationale disclosure
- Limitation statement
- User-facing transparency
- Internal explanation evidence
- Explanation quality

**Excluded**

- Raw audit log storage
- Formal compliance filing
- Prompt injection prevention
- Supply-chain dependency assurance

**Related Standards**

- ISO/IEC 42001 A.9 Impact Assessment
- NIST AI RMF MEASURE
- EU AI Act Transparency
- EU AI Act Technical Documentation
- Korea Financial AI Guideline Trustworthiness

**Related Plane**

- Trust Plane
- Audit Plane

**Related Policies**

- Explainability Policy
- Transparency Policy
- Rationale Disclosure Policy
- Limitation Disclosure Policy

**Example Questions**

- Q221
- Q222
- Q223

### D23 Compliance

**Purpose**

Agent 운영과 AI 사용이 적용 법규, 표준, 내부정책, 산업 가이드라인, 증빙 요구사항을 충족하는지 관리한다.

**Scope**

- Regulatory obligation
- Standard compliance
- Internal policy adherence
- Control evidence sufficiency
- Compliance review
- Legal or regulatory mapping

**Excluded**

- Technical audit logging mechanics
- Explainability content quality
- Operational recovery plan
- Agent identity issuance

**Related Standards**

- ISO/IEC 42001 A.5 AI Policy
- ISO/IEC 42001 A.9 Impact Assessment
- ISO/IEC 42001 A.10 Third Party and Customer Relationships
- NIST AI RMF GOV
- NIST AI RMF MANAGE
- EU AI Act Technical Documentation
- EU AI Act Transparency
- Korea Financial AI Guideline Legality

**Related Plane**

- Control Plane
- Audit Plane

**Related Policies**

- Compliance Policy
- Regulatory Mapping Policy
- Control Evidence Policy
- Legal Review Policy

**Example Questions**

- Q231
- Q232
- Q233

### D24 Business Continuity

**Purpose**

Agent 장애, 오작동, 의존성 중단, 데이터 또는 서비스 장애가 업무 지속성에 미치는 영향을 줄이고 복구 책임을 보장한다.

**Scope**

- Service disruption
- Recovery objective
- Fallback process
- Dependency outage
- Operational resilience
- Incident continuity
- Degraded mode handling

**Excluded**

- Strategic AI governance charter
- Compliance obligation mapping
- Hallucination factuality control
- Prompt security attack prevention

**Related Standards**

- ISO/IEC 42001 A.7 Resources for AI Systems
- ISO/IEC 42001 A.8 AI System Lifecycle
- NIST AI RMF MANAGE
- EU AI Act Accuracy & Robustness
- EU AI Act Cybersecurity
- Korea Financial AI Guideline Financial Stability
- Korea Financial AI Guideline Security

**Related Plane**

- Control Plane
- Override Plane
- Audit Plane

**Related Policies**

- Business Continuity Policy
- Resilience Policy
- Fallback Policy
- Incident Continuity Policy

**Example Questions**

- Q241
- Q242
- Q243

### D25 Strategic Governance

**Purpose**

조직 차원의 AI 방향성, 책임체계, 위험수용 기준, 정책 승인, 경영진 감독, 우선순위를 확정한다.

**Scope**

- AI governance strategy
- Executive oversight
- Risk appetite
- Policy ownership
- Governance review
- Organization-wide accountability
- Strategic priority alignment
- Board Oversight
- AI Governance Committee
- Management Accountability
- Three Lines of Defense
- Risk Governance Charter
- Governance Reporting

**Excluded**

- Individual runtime decision execution
- Low-level tool invocation
- Raw audit log capture
- Specific prompt attack handling

**Related Standards**

- ISO/IEC 42001 A.5 AI Policy
- ISO/IEC 42001 A.6 Internal Organization
- ISO/IEC 42001 A.2 Governance
- NIST AI RMF GOV
- EU AI Act Risk Management
- EU AI Act Technical Documentation
- Korea Financial AI Guideline Governance
- Korea Financial Services Commission Governance

**Related Plane**

- Control Plane
- Audit Plane

**Related Policies**

- Strategic Governance Policy
- AI Policy Ownership Policy
- Risk Appetite Policy
- Executive Oversight Policy
- Board Oversight Policy
- AI Governance Committee Policy
- Management Accountability Policy
- Risk Governance Charter Policy

**Example Questions**

- Q248
- Q249
- Q250

## Boundary Clarifications

### D18 and D19 Difference

D18 Supply Chain governs non-agent and enabling dependencies such as models, datasets, tools, libraries, infrastructure services, and supplier components. D19 Third Party Agents governs externally owned or externally operated agents as actors, including their identity, authority, behavior, and cross-organization accountability.

### D21 and D23 Difference

D21 Auditability is about whether actions, decisions, evidence, and control outcomes are traceable and reviewable. D23 Compliance is about whether applicable legal, regulatory, standards, and internal-policy obligations are identified and satisfied. Auditability supplies evidence; Compliance interprets obligations and determines conformity.

### Why D08 Is an Independent Domain

D08 AI Risk Management is independent because risk identification, assessment, treatment, escalation, acceptance, and residual-risk ownership cut across all other domains. It is not the same as compliance, auditability, model governance, prompt security, or business continuity; it defines the risk-management discipline that decides how AI-specific risk is prioritized and handled.

### Why Q147 Belongs to D14

Q147 belongs to D14 Knowledge Sources when the assessed issue is the origin, credibility, freshness, authorization, or traceability of knowledge used by an Agent. If the same scenario later produces an unsupported output, that output issue may relate to D15 Hallucination, but the source-governance question remains D14.

## Additional Boundary Clarifications

### D08 vs D23

D08 AI Risk Management identifies, evaluates, accepts, and mitigates AI risk. D23 Compliance satisfies regulatory, legal, standards, and internal-policy obligations.

### D17 vs D18

D17 Model Governance governs the model itself, including model selection, approval, classification, lifecycle, and retirement. D18 Supply Chain governs the full supply chain around the model, including datasets, tools, libraries, services, infrastructure, suppliers, and other dependencies.

### D06 vs D03

D03 Runtime Decision Control governs system control over runtime decisions and action execution. D06 Human Override governs human control, including human review, confirmation, stop, recovery, and escalation authority.

## Completion Confirmation

| Completion Item | Status |
| --- | --- |
| 25 fixed domains defined | Complete |
| Purpose defined for each domain | Complete |
| Scope defined for each domain | Complete |
| Excluded scope defined for each domain | Complete |
| Standards mapped for each domain | Complete |
| Plane mapped for each domain | Complete |
| Policies mapped for each domain | Complete |
| Example questions mapped for each domain | Complete |
| Q001-Q250 modified | Not modified |
| Domain added, deleted, or renamed | Not modified |
| Meta model modified | Not modified |
| Standards crosswalk modified | Not modified |
| Code modified | Not modified |
| Dependencies added | None |
