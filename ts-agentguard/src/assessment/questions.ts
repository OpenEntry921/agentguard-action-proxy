import { AssessmentQuestion } from "./types";

export const assessmentQuestions: AssessmentQuestion[] = [
  { id: "ai_usage_1", domain: "ai_usage", domainLabel: "AI Usage", prompt: "회사 차원의 AI 사용 현황을 파악하고 있는가?" },
  { id: "ai_usage_2", domain: "ai_usage", domainLabel: "AI Usage", prompt: "어떤 AI 도구를 누가 사용하는지 관리하고 있는가?" },
  { id: "ai_usage_3", domain: "ai_usage", domainLabel: "AI Usage", prompt: "AI 사용 목적과 업무 범위가 정의되어 있는가?" },
  { id: "ai_usage_4", domain: "ai_usage", domainLabel: "AI Usage", prompt: "AI 사용 승인 절차가 있는가?" },

  { id: "data_protection_1", domain: "data_protection", domainLabel: "Data Protection", prompt: "직원이 고객정보를 AI에 입력하지 못하도록 정책이 있는가?" },
  { id: "data_protection_2", domain: "data_protection", domainLabel: "Data Protection", prompt: "민감정보 분류 체계가 있는가?" },
  { id: "data_protection_3", domain: "data_protection", domainLabel: "Data Protection", prompt: "AI 입력 데이터 로그를 관리하는가?" },
  { id: "data_protection_4", domain: "data_protection", domainLabel: "Data Protection", prompt: "외부 AI 도구 사용 시 데이터 반출 기준이 있는가?" },

  { id: "access_control_1", domain: "access_control", domainLabel: "Access Control", prompt: "AI Agent가 접근 가능한 시스템 범위가 정의되어 있는가?" },
  { id: "access_control_2", domain: "access_control", domainLabel: "Access Control", prompt: "GitHub, ERP, CRM, 금융 API 접근 권한이 통제되는가?" },
  { id: "access_control_3", domain: "access_control", domainLabel: "Access Control", prompt: "고위험 작업은 별도 승인 절차가 있는가?" },
  { id: "access_control_4", domain: "access_control", domainLabel: "Access Control", prompt: "역할별 권한 분리가 되어 있는가?" },

  { id: "audit_traceability_1", domain: "audit_traceability", domainLabel: "Audit & Traceability", prompt: "누가 어떤 AI를 사용했는지 기록되는가?" },
  { id: "audit_traceability_2", domain: "audit_traceability", domainLabel: "Audit & Traceability", prompt: "AI가 생성한 결과물의 출처와 근거가 기록되는가?" },
  { id: "audit_traceability_3", domain: "audit_traceability", domainLabel: "Audit & Traceability", prompt: "AI Agent 실행 로그가 남는가?" },
  { id: "audit_traceability_4", domain: "audit_traceability", domainLabel: "Audit & Traceability", prompt: "사고 발생 시 추적 가능한 감사 로그가 있는가?" },

  { id: "agent_risk_1", domain: "agent_risk", domainLabel: "Agent Risk", prompt: "AI가 외부 API를 호출하거나 자동 실행하는가?" },
  { id: "agent_risk_2", domain: "agent_risk", domainLabel: "Agent Risk", prompt: "AI가 결제, 송금, 배포, 삭제 같은 고위험 행동을 할 수 있는가?" },
  { id: "agent_risk_3", domain: "agent_risk", domainLabel: "Agent Risk", prompt: "Human-in-the-loop 승인 체계가 있는가?" },
  { id: "agent_risk_4", domain: "agent_risk", domainLabel: "Agent Risk", prompt: "AI 행동을 실행 직전에 차단할 수 있는가?" },
];
