import { AssessmentQuestion } from "./types";

export const assessmentQuestions: AssessmentQuestion[] = [
  { id: "ai_usage_1", domain: "AI_USAGE", title: "회사는 AI 사용 현황을 파악하고 있는가?" },
  { id: "ai_usage_2", domain: "AI_USAGE", title: "어떤 AI를 누가 사용하는지 관리하는가?" },
  { id: "ai_usage_3", domain: "AI_USAGE", title: "AI 사용 목적이 정의되어 있는가?" },
  { id: "ai_usage_4", domain: "AI_USAGE", title: "AI 사용 승인 절차가 있는가?" },

  { id: "data_protection_1", domain: "DATA_PROTECTION", title: "민감정보 입력 정책이 있는가?" },
  { id: "data_protection_2", domain: "DATA_PROTECTION", title: "데이터 분류 체계가 있는가?" },
  { id: "data_protection_3", domain: "DATA_PROTECTION", title: "외부 AI 사용 가이드가 있는가?" },
  { id: "data_protection_4", domain: "DATA_PROTECTION", title: "데이터 유출 방지 통제가 있는가?" },

  { id: "access_control_1", domain: "ACCESS_CONTROL", title: "AI 접근 권한이 정의되어 있는가?" },
  { id: "access_control_2", domain: "ACCESS_CONTROL", title: "고위험 작업 승인 절차가 있는가?" },
  { id: "access_control_3", domain: "ACCESS_CONTROL", title: "권한 분리가 되어 있는가?" },
  { id: "access_control_4", domain: "ACCESS_CONTROL", title: "시스템 접근이 통제되는가?" },

  { id: "audit_traceability_1", domain: "AUDIT_TRACEABILITY", title: "AI 사용 로그가 남는가?" },
  { id: "audit_traceability_2", domain: "AUDIT_TRACEABILITY", title: "실행 이력이 기록되는가?" },
  { id: "audit_traceability_3", domain: "AUDIT_TRACEABILITY", title: "결과 추적이 가능한가?" },
  { id: "audit_traceability_4", domain: "AUDIT_TRACEABILITY", title: "감사 로그가 보관되는가?" },

  { id: "agent_risk_1", domain: "AGENT_RISK", title: "AI Agent가 GitHub 접근 가능한가?" },
  { id: "agent_risk_2", domain: "AGENT_RISK", title: "AI Agent가 ERP 접근 가능한가?" },
  { id: "agent_risk_3", domain: "AGENT_RISK", title: "AI Agent가 AWS 접근 가능한가?" },
  { id: "agent_risk_4", domain: "AGENT_RISK", title: "AI Agent가 외부 API를 실행하는가?" },
];
