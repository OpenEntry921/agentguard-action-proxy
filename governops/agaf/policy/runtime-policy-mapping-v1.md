# AGAF Runtime Policy Mapping v1

## Scope

This document maps only the AGAF questions that are directly related to AgentGuard Runtime controls in this design step:

- Q031
- Q032
- Q051
- Q052
- Q053
- Q201
- Q202
- Q211
- Q212

This file is policy data only. It does not implement AgentGuard Runtime behavior, interceptors, enforcement logic, policy compilation, decision records, agent identity code, TypeScript files, or demo behavior.

---

## Q031

question_id: Q031

control_objective:
Transaction Limit Enforcement

domain_type:
ACTION

action_taxonomy:
gold.purchase

generated_policy:
budget_limit=5000000

agentguard_enforcement_type:
BLOCK

decision_record_profile:
FORENSIC

runtime_rule:
IF amount > 5000000
THEN BLOCK

---

## Q032

question_id: Q032

control_objective:
Human Approval for High-Value or Abnormal Financial Transactions

domain_type:
ACTION

action_taxonomy:
gold.purchase.approval

generated_policy:
approval_required=true; approval_threshold=high_value_or_abnormal_transaction

agentguard_enforcement_type:
REVIEW

decision_record_profile:
FORENSIC

runtime_rule:
IF amount > approval_threshold OR transaction_pattern == abnormal
THEN REVIEW

---

## Q051

question_id: Q051

control_objective:
Emergency Agent Stop Enforcement

domain_type:
ACTION

action_taxonomy:
agent.lifecycle.kill_switch

generated_policy:
emergency_stop_enabled=true; human_stop_authority=required

agentguard_enforcement_type:
FREEZE

decision_record_profile:
FORENSIC

runtime_rule:
IF human.emergency_stop == true
THEN FREEZE

---

## Q052

question_id: Q052

control_objective:
Human Override Primacy Enforcement

domain_type:
ACTION

action_taxonomy:
agent.decision.override

generated_policy:
human_override_priority=always; agent_decision_supersedable=true

agentguard_enforcement_type:
BLOCK

decision_record_profile:
FORENSIC

runtime_rule:
IF human.override == true AND agent.continues_original_decision == true
THEN BLOCK

---

## Q053

question_id: Q053

control_objective:
High-Risk Decision Human Checkpoint

domain_type:
ACTION

action_taxonomy:
decision.high_risk.checkpoint

generated_policy:
human_checkpoint_required=true; risk_level=high

agentguard_enforcement_type:
REVIEW

decision_record_profile:
FORENSIC

runtime_rule:
IF decision.risk == high AND human_checkpoint.completed != true
THEN REVIEW

---

## Q201

question_id: Q201

control_objective:
Immutable Audit Logging for Critical Agent Actions

domain_type:
AUDIT

action_taxonomy:
audit.critical_action.log

generated_policy:
immutable_audit_log_required=true; critical_action_logging=required

agentguard_enforcement_type:
BLOCK

decision_record_profile:
FORENSIC

runtime_rule:
IF action.critical == true AND audit_log.immutable_recorded != true
THEN BLOCK

---

## Q202

question_id: Q202

control_objective:
Audit Log Completeness Enforcement

domain_type:
AUDIT

action_taxonomy:
audit.log.completeness

generated_policy:
required_log_fields=who,what,when,why

agentguard_enforcement_type:
REVIEW

decision_record_profile:
STANDARD

runtime_rule:
IF audit_log.missing_fields CONTAINS any(who, what, when, why)
THEN REVIEW

---

## Q211

question_id: Q211

control_objective:
Explainability Availability for High-Stakes Agent Decisions

domain_type:
AUDIT

action_taxonomy:
decision.explainability.availability

generated_policy:
explanation_required=true; high_stakes_unexplainable_block=true

agentguard_enforcement_type:
BLOCK

decision_record_profile:
STANDARD

runtime_rule:
IF decision.high_stakes == true AND explanation.available != true
THEN BLOCK

---

## Q212

question_id: Q212

control_objective:
Human-Understandable Rationale for High-Risk Decisions

domain_type:
AUDIT

action_taxonomy:
decision.explainability.human_rationale

generated_policy:
human_rationale_required=true; applies_to=high_risk_decision

agentguard_enforcement_type:
REVIEW

decision_record_profile:
FORENSIC

runtime_rule:
IF decision.high_risk == true AND rationale.human_understandable != true
THEN REVIEW

---

## Runtime Policy Coverage Summary

| question_id | domain_type | Runtime Layer | Runtime Policy Focus | AgentGuard Enforcement Type |
| --- | --- | --- | --- | --- |
| Q031 | ACTION | Action Control Layer | Transaction limit enforcement | BLOCK |
| Q032 | ACTION | Action Control Layer | Human approval gate for high-value or abnormal financial transactions | REVIEW |
| Q051 | ACTION | Action Control Layer | Emergency kill switch / agent freeze | FREEZE |
| Q052 | ACTION | Action Control Layer | Human override primacy over autonomous decisions | BLOCK |
| Q053 | ACTION | Action Control Layer | Human checkpoint for high-risk decisions | REVIEW |
| Q201 | AUDIT | Decision Record Layer | Immutable critical-action audit record | BLOCK |
| Q202 | AUDIT | Decision Record Layer | Complete who/what/when/why audit record | REVIEW |
| Q211 | AUDIT | Decision Record Layer | Explanation availability for high-stakes decisions | BLOCK |
| Q212 | AUDIT | Decision Record Layer | Human-understandable high-risk rationale | REVIEW |

### Coverage by Domain Type

| domain_type | question_ids | Runtime Layer |
| --- | --- | --- |
| ACTION | Q031, Q032, Q051, Q052, Q053 | Action Control Layer |
| AUDIT | Q201, Q202, Q211, Q212 | Decision Record Layer |
| IDENTITY | None in this mapping set | Agent Identity Layer |
