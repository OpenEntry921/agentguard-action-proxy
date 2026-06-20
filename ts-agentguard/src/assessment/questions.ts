import { AssessmentQuestion } from "./types";

export const domainLabels: Record<AssessmentQuestion["domain"], string> = {
  FINANCIAL_ACTIONS: "D04 금전 실행 관리",
  AI_RISK_MANAGEMENT: "D08 AI 위험관리",
  PRIVACY_DATA_PROTECTION: "D13 개인정보 및 데이터 보호",
  MODEL_GOVERNANCE_HUMAN_OVERSIGHT: "D17 AI 운영 관리 및 사람의 검토",
  STRATEGIC_GOVERNANCE: "D25 전략 거버넌스",
};

export const assessmentQuestions: AssessmentQuestion[] = [
  { id: "financial_actions_1", displayId: "Q041", domain: "FINANCIAL_ACTIONS", title: "AI가 결제, 환불, 송금 등 금전 관련 행동을 하기 전에 승인 절차가 있습니까?" },
  { id: "financial_actions_2", displayId: "Q042", domain: "FINANCIAL_ACTIONS", title: "AI가 승인 없이 회사 비용을 발생시킬 위험을 관리하고 있습니까?" },
  { id: "financial_actions_3", displayId: "Q043", domain: "FINANCIAL_ACTIONS", title: "AI가 잘못된 금액이나 잘못된 거래처로 처리하지 않도록 확인 절차가 있습니까?" },
  { id: "financial_actions_4", displayId: "Q044", domain: "FINANCIAL_ACTIONS", title: "금전 관련 AI 행동의 책임자와 승인 기준이 명확합니까?" },
  { id: "financial_actions_5", displayId: "Q045", domain: "FINANCIAL_ACTIONS", title: "금전 관련 AI 사용 내역을 사후에 검토할 수 있습니까?" },

  { id: "ai_risk_management_1", displayId: "Q071", domain: "AI_RISK_MANAGEMENT", title: "AI가 회사 정책을 위반할 위험을 정기적으로 점검합니까?" },
  { id: "ai_risk_management_2", displayId: "Q072", domain: "AI_RISK_MANAGEMENT", title: "AI가 승인 없이 행동할 위험을 줄이기 위한 기준이 있습니까?" },
  { id: "ai_risk_management_3", displayId: "Q073", domain: "AI_RISK_MANAGEMENT", title: "AI가 잘못된 결정을 내릴 경우 즉시 중단하거나 수정할 방법이 있습니까?" },
  { id: "ai_risk_management_4", displayId: "Q074", domain: "AI_RISK_MANAGEMENT", title: "AI 사용으로 생길 수 있는 고객, 재무, 평판 위험을 관리합니까?" },
  { id: "ai_risk_management_5", displayId: "Q075", domain: "AI_RISK_MANAGEMENT", title: "새로운 AI 사용 사례를 도입하기 전에 위험을 검토합니까?" },

  { id: "privacy_data_protection_1", displayId: "Q131", domain: "PRIVACY_DATA_PROTECTION", title: "AI가 고객정보를 외부로 보낼 위험을 관리하고 있습니까?" },
  { id: "privacy_data_protection_2", displayId: "Q132", domain: "PRIVACY_DATA_PROTECTION", title: "직원들이 AI에 입력하면 안 되는 정보의 기준을 알고 있습니까?" },
  { id: "privacy_data_protection_3", displayId: "Q133", domain: "PRIVACY_DATA_PROTECTION", title: "개인정보나 영업비밀이 AI 사용 과정에서 노출되지 않도록 확인합니까?" },
  { id: "privacy_data_protection_4", displayId: "Q134", domain: "PRIVACY_DATA_PROTECTION", title: "AI 사용 시 고객정보 보호 책임자가 검토할 수 있는 절차가 있습니까?" },
  { id: "privacy_data_protection_5", displayId: "Q135", domain: "PRIVACY_DATA_PROTECTION", title: "데이터 보호 사고가 발생했을 때 대응 절차가 준비되어 있습니까?" },

  { id: "model_governance_human_oversight_1", displayId: "Q171", domain: "MODEL_GOVERNANCE_HUMAN_OVERSIGHT", title: "중요한 AI 결과를 사람이 검토하는 절차가 있습니까?" },
  { id: "model_governance_human_oversight_2", displayId: "Q172", domain: "MODEL_GOVERNANCE_HUMAN_OVERSIGHT", title: "AI가 잘못된 결정을 내렸을 때 책임자와 수정 절차가 명확합니까?" },
  { id: "model_governance_human_oversight_3", displayId: "Q173", domain: "MODEL_GOVERNANCE_HUMAN_OVERSIGHT", title: "AI 결과의 품질과 오류를 정기적으로 확인합니까?" },
  { id: "model_governance_human_oversight_4", displayId: "Q174", domain: "MODEL_GOVERNANCE_HUMAN_OVERSIGHT", title: "AI가 고객이나 직원에게 큰 영향을 주는 결정을 단독으로 하지 않도록 제한합니까?" },
  { id: "model_governance_human_oversight_5", displayId: "Q175", domain: "MODEL_GOVERNANCE_HUMAN_OVERSIGHT", title: "AI 사용 변경사항을 기록하고 승인합니까?" },

  { id: "strategic_governance_1", displayId: "Q251", domain: "STRATEGIC_GOVERNANCE", title: "경영진이 AI 사용 원칙과 책임 기준을 승인했습니까?" },
  { id: "strategic_governance_2", displayId: "Q252", domain: "STRATEGIC_GOVERNANCE", title: "AI 거버넌스가 회사의 사업 목표와 위험 관리 계획에 포함되어 있습니까?" },
  { id: "strategic_governance_3", displayId: "Q253", domain: "STRATEGIC_GOVERNANCE", title: "AI 관련 역할과 의사결정 권한이 명확합니까?" },
  { id: "strategic_governance_4", displayId: "Q254", domain: "STRATEGIC_GOVERNANCE", title: "AI 관련 규제와 감사 요구사항을 정기적으로 확인합니까?" },
  { id: "strategic_governance_5", displayId: "Q255", domain: "STRATEGIC_GOVERNANCE", title: "AI 거버넌스 개선 계획과 실행 일정이 있습니까?" },
];
