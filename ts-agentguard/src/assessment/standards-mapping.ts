import type { DomainScore, StandardsAlignment, StandardsAlignmentStatus } from "./types";

const standardsByDomain: Record<DomainScore["domain"], Omit<StandardsAlignment, "score" | "status" | "impact">> = {
  FINANCIAL_ACTIONS: {
    domain: "FINANCIAL_ACTIONS",
    label: "D04 금전 실행 관리",
    summary: "금전 실행 승인, 한도, 예외 처리 통제가 표준 관점에서 충분한지 확인합니다.",
    standards: [
      {
        framework: "ISO/IEC 42001",
        reference: "ISO/IEC 42001 A.6 / A.8",
        meaning: "AI가 금전 실행, 거래 승인, 한도 적용 등 중요한 업무에 관여할 경우 책임과 통제 절차를 명확히 해야 한다는 기준입니다.",
        currentImplication: "D04 점수가 낮으면 AI가 금전 실행이나 거래 관련 행동을 수행할 때 승인, 한도, 예외 처리, 감사 기록이 충분하지 않을 수 있습니다.",
        recommendedImprovement: "금전 실행 전 사전 승인 기준, 거래 한도, 예외 승인 절차, 감사 기록 보존 기준을 마련해야 합니다.",
      },
      {
        framework: "NIST AI RMF",
        reference: "NIST AI RMF MANAGE",
        meaning: "AI 위험을 실제 운영 과정에서 줄이고 관리하기 위한 통제 활동을 요구하는 기준입니다.",
        currentImplication: "D04 점수가 낮으면 AI가 수행하는 금전 관련 행동에 대한 운영 통제가 충분하지 않은 상태로 볼 수 있습니다.",
        recommendedImprovement: "금전 실행 관련 고위험 행동은 사람의 승인 또는 추가 검토를 거치도록 운영 기준을 설정해야 합니다.",
      },
      {
        framework: "EU AI Act",
        reference: "EU AI Act Risk Management / Human Oversight",
        meaning: "고위험 AI 시스템은 위험을 줄이기 위한 관리 절차와 사람의 감독 체계를 갖추어야 한다는 기준입니다.",
        currentImplication: "D04 점수가 낮으면 금전 실행과 같은 고영향 행동에서 사람의 감독과 승인 절차가 부족할 수 있습니다.",
        recommendedImprovement: "금전 실행 관련 AI 행동은 자동 실행 전에 승인 또는 검토 절차를 거치도록 해야 합니다.",
      },
      {
        framework: "금융위 AI 가이드라인",
        reference: "금융위 AI 가이드라인 / 위험통제",
        meaning: "금융회사는 AI 서비스의 위험 수준에 따라 차등화된 통제와 관리 절차를 적용해야 합니다.",
        currentImplication: "D04 점수가 낮으면 금융거래와 관련된 AI 행동에 대한 위험기반 통제가 부족한 것으로 해석됩니다.",
        recommendedImprovement: "AI 금전 실행 업무에 대해 위험등급별 승인, 기록, 사후점검 체계를 마련해야 합니다.",
      },
    ],
  },
  AI_RISK_MANAGEMENT: {
    domain: "AI_RISK_MANAGEMENT",
    label: "D08 AI 위험관리",
    summary: "AI 위험 식별, 등급화, 잔여위험 관리 체계가 표준 요구와 연결됩니다.",
    standards: [
      {
        framework: "ISO/IEC 42001",
        reference: "ISO/IEC 42001 A.5 / A.9",
        meaning: "조직은 AI 위험을 식별하고 평가하며, 영향도와 잔여위험을 관리하는 체계를 갖추어야 한다는 기준입니다.",
        currentImplication: "D08 점수가 낮으면 AI 위험 목록, 위험등급, 잔여위험 평가 체계가 충분히 정착되지 않은 상태로 볼 수 있습니다.",
        recommendedImprovement: "AI Risk Register, 위험등급 기준, 잔여위험 평가 및 위험 수용 절차를 구축해야 합니다.",
      },
      {
        framework: "NIST AI RMF",
        reference: "NIST AI RMF MAP / MEASURE / MANAGE",
        meaning: "AI 위험을 발견하고 측정하며, 이후 통제와 개선 활동으로 연결해야 한다는 기준입니다.",
        currentImplication: "D08 점수가 낮으면 AI 위험을 발견하거나 측정하는 체계가 약하고, 위험 관리 활동이 체계적으로 연결되지 않을 수 있습니다.",
        recommendedImprovement: "AI 위험 식별, 위험 측정, 위험 경감, 잔여위험 평가를 하나의 관리 프로세스로 연결해야 합니다.",
      },
      {
        framework: "EU AI Act",
        reference: "EU AI Act Risk Management System",
        meaning: "고위험 AI 시스템은 전체 수명주기 동안 위험관리 시스템을 운영해야 한다는 기준입니다.",
        currentImplication: "D08 점수가 낮으면 고위험 AI 서비스에 대한 위험관리 체계가 미흡할 수 있습니다.",
        recommendedImprovement: "고위험 AI 서비스별 위험관리 절차, 승인 기준, 모니터링 기준을 마련해야 합니다.",
      },
      {
        framework: "금융위 AI 가이드라인",
        reference: "금융위 AI 가이드라인 / 위험관리",
        meaning: "금융회사는 AI 서비스별 위험을 인식·측정하고, 위험 경감 및 잔여위험 평가를 수행해야 합니다.",
        currentImplication: "D08 점수가 낮으면 금융위 AI 위험관리 요구사항에 대응하기 위한 기본 체계가 부족한 것으로 해석됩니다.",
        recommendedImprovement: "AI 서비스별 위험평가, 위험등급 산정, 경영진 보고 체계를 구축해야 합니다.",
      },
    ],
  },
  PRIVACY_DATA_PROTECTION: {
    domain: "PRIVACY_DATA_PROTECTION",
    label: "D13 개인정보 및 데이터 보호",
    summary: "개인정보와 민감정보 처리 통제가 데이터 거버넌스 기준과 연결됩니다.",
    standards: [
      {
        framework: "ISO/IEC 42001",
        reference: "ISO/IEC 42001 A.7",
        meaning: "AI 시스템에 사용되는 데이터가 적절히 관리되고 보호되어야 한다는 기준입니다.",
        currentImplication: "D13 점수가 낮으면 AI 입력 데이터, 민감정보, 고객정보 처리 기준이 충분히 관리되지 않을 수 있습니다.",
        recommendedImprovement: "민감정보 처리 기준, 데이터 접근 통제, 외부 전송 점검 절차를 마련해야 합니다.",
      },
      {
        framework: "NIST AI RMF",
        reference: "NIST AI RMF MAP / MEASURE",
        meaning: "AI 시스템이 사용하는 데이터의 출처, 품질, 민감도, 위험 영향을 파악하고 측정해야 한다는 기준입니다.",
        currentImplication: "D13 점수가 낮으면 AI가 사용하는 데이터의 민감도와 보호 필요성이 충분히 평가되지 않은 상태일 수 있습니다.",
        recommendedImprovement: "AI 데이터 사용 현황을 파악하고 민감정보 사용 여부, 외부 전송 여부, 접근 권한을 점검해야 합니다.",
      },
      {
        framework: "EU AI Act",
        reference: "EU AI Act Data Governance",
        meaning: "AI 시스템에 사용되는 데이터는 품질, 적합성, 편향, 보호 요건을 충족해야 한다는 기준입니다.",
        currentImplication: "D13 점수가 낮으면 AI 데이터 처리 과정에서 데이터 보호와 거버넌스 체계가 부족할 수 있습니다.",
        recommendedImprovement: "AI 데이터 처리 기준, 데이터 품질 점검, 개인정보 보호 통제 절차를 강화해야 합니다.",
      },
      {
        framework: "금융위 AI 가이드라인",
        reference: "금융위 AI 가이드라인 / 신뢰성 / 보안성",
        meaning: "금융회사는 AI 서비스의 데이터 품질, 설명 가능성, 보안 위협, 개인정보 보호를 관리해야 합니다.",
        currentImplication: "D13 점수가 낮으면 고객정보 보호와 AI 데이터 보안 관리가 충분하지 않은 것으로 해석됩니다.",
        recommendedImprovement: "고객정보 보호 기준, 데이터 접근 권한, 보안 점검, 사고 대응 절차를 마련해야 합니다.",
      },
    ],
  },
  MODEL_GOVERNANCE_HUMAN_OVERSIGHT: {
    domain: "MODEL_GOVERNANCE_HUMAN_OVERSIGHT",
    label: "D17 AI 운영 관리 및 사람의 검토",
    summary: "사람의 검토와 고위험 AI 의사결정 통제가 핵심 표준 영향 영역입니다.",
    standards: [
      {
        framework: "ISO/IEC 42001",
        reference: "ISO/IEC 42001 A.8",
        meaning: "AI 시스템의 운영 과정에서 책임 있는 관리, 검토, 변경, 감독 절차가 필요하다는 기준입니다.",
        currentImplication: "D17 점수가 낮으면 AI 운영 과정에서 사람의 검토와 감독 체계가 충분히 작동하지 않을 수 있습니다.",
        recommendedImprovement: "고위험 AI 행동에 대해 사람의 검토, 승인, 기록 보존 절차를 마련해야 합니다.",
      },
      {
        framework: "NIST AI RMF",
        reference: "NIST AI RMF MANAGE",
        meaning: "AI 위험을 줄이기 위해 운영 중 통제, 모니터링, 대응 절차를 수행해야 한다는 기준입니다.",
        currentImplication: "D17 점수가 낮으면 AI 운영 중 발생하는 위험을 실시간 또는 정기적으로 통제하는 체계가 부족할 수 있습니다.",
        recommendedImprovement: "고위험 AI 행동에 대한 검토, 승인, 중단, 사후점검 절차를 구축해야 합니다.",
      },
      {
        framework: "EU AI Act",
        reference: "EU AI Act Human Oversight",
        meaning: "고위험 AI 시스템은 사람이 적절히 감독하고 필요 시 개입할 수 있어야 한다는 기준입니다.",
        currentImplication: "D17 점수가 낮으면 AI가 중요한 행동을 수행할 때 사람이 개입하거나 중단할 수 있는 체계가 부족할 수 있습니다.",
        recommendedImprovement: "고위험 AI 행동은 자동 실행하지 않고 사람의 검토 또는 승인 절차를 거치도록 해야 합니다.",
      },
      {
        framework: "금융위 AI 가이드라인",
        reference: "금융위 AI 가이드라인 / 보조수단성 / 거버넌스",
        meaning: "AI는 최종 의사결정자가 아니라 업무 보조수단이며, 최종 책임은 임직원에게 귀속되어야 한다는 기준입니다.",
        currentImplication: "D17 점수가 낮으면 AI 결과에 대한 사람의 책임, 검토, 승인 체계가 불명확할 수 있습니다.",
        recommendedImprovement: "AI 결과 활용 시 담당자, 승인자, 검토자, 책임자를 명확히 지정해야 합니다.",
      },
    ],
  },
  STRATEGIC_GOVERNANCE: {
    domain: "STRATEGIC_GOVERNANCE",
    label: "D25 전략 거버넌스",
    summary: "경영진 책임, 정책 승인, 보고 체계가 전사 거버넌스 기준과 연결됩니다.",
    standards: [
      {
        framework: "ISO/IEC 42001",
        reference: "ISO/IEC 42001 A.3 / A.5",
        meaning: "조직은 AI 정책, 책임, 역할, 경영진 보고 체계를 명확히 해야 한다는 기준입니다.",
        currentImplication: "D25 점수가 낮으면 AI 거버넌스가 전사 전략과 연결되지 않고, 경영진 책임 체계가 불명확할 수 있습니다.",
        recommendedImprovement: "AI 거버넌스 위원회, 경영진 보고 체계, AI 정책 승인 절차를 마련해야 합니다.",
      },
      {
        framework: "NIST AI RMF",
        reference: "NIST AI RMF GOVERN",
        meaning: "AI 위험관리를 조직의 정책, 책임, 문화, 의사결정 체계에 반영해야 한다는 기준입니다.",
        currentImplication: "D25 점수가 낮으면 AI 위험관리가 조직 차원의 책임과 의사결정 체계로 정착되지 않은 상태일 수 있습니다.",
        recommendedImprovement: "AI 거버넌스 책임자, 위원회, 정기 보고, 정책 승인 체계를 구축해야 합니다.",
      },
      {
        framework: "EU AI Act",
        reference: "EU AI Act Governance & Accountability",
        meaning: "AI 시스템 운영자는 위험관리, 문서화, 감독, 책임성 확보 의무를 이행해야 한다는 기준입니다.",
        currentImplication: "D25 점수가 낮으면 AI 운영 책임과 내부 관리 체계가 충분히 명확하지 않을 수 있습니다.",
        recommendedImprovement: "AI 운영 책임자, 내부통제 기준, 의사결정 기록, 경영진 보고 체계를 정비해야 합니다.",
      },
      {
        framework: "금융위 AI 가이드라인",
        reference: "금융위 AI 가이드라인 / 거버넌스",
        meaning: "이사회와 경영진은 AI 활용과 위험관리 체계의 적정성을 점검하고 관리해야 합니다.",
        currentImplication: "D25 점수가 낮으면 이사회·경영진 차원의 AI 감독 체계가 부족한 것으로 해석됩니다.",
        recommendedImprovement: "AI 활용 현황, 주요 위험, 개선계획을 경영진 또는 위원회에 정기 보고하는 체계를 마련해야 합니다.",
      },
    ],
  },
};

export function standardsStatusForScore(score: number): StandardsAlignmentStatus {
  if (score >= 90) return "GREEN";
  if (score >= 70) return "YELLOW";
  return "RED";
}

function standardsImpactForStatus(status: StandardsAlignmentStatus): StandardsAlignment["impact"] {
  if (status === "GREEN") return "낮음";
  if (status === "YELLOW") return "중간";
  return "높음";
}

export function buildStandardsAlignment(domainScores: DomainScore[]): StandardsAlignment[] {
  return domainScores.map((domainScore) => {
    const status = standardsStatusForScore(domainScore.score);
    return {
      ...standardsByDomain[domainScore.domain],
      label: domainScore.label,
      score: domainScore.score,
      status,
      impact: standardsImpactForStatus(status),
    };
  });
}
