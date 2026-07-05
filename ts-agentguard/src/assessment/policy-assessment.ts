import { AssessmentResult } from "./types";

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

export const policySamples = [
  "광주은행_AI_정책.pdf",
  "OO은행_AI_정책.pdf",
  "OpenEntry_AI_Policy.pdf",
] as const;

export type PolicySampleFile = (typeof policySamples)[number];

interface PolicyAssessmentResult extends AssessmentResult {
  organizationName: string;
  policySource: PolicySampleFile;
  policyOverview: string;
  gapAnalysis: string[];
}

const base = {
  maxScore: 100 as const,
  riskLevel: "High Risk" as const,
  maturityLevel: { level: 2 as const, label: "Developing" as const, displayName: "Level 2 Developing" },
  governanceGrade: "C" as const,
  aiReadiness: "Partially Ready" as const,
  regulatoryReadiness: "Partially Ready" as const,
  controlMaturity: "Developing" as const,
  auditReadiness: "Not Ready" as const,
};

const policyResults: Record<PolicySampleFile, PolicyAssessmentResult> = {
  "광주은행_AI_정책.pdf": {
    ...base,
    organizationName: "광주은행",
    policySource: "광주은행_AI_정책.pdf",
    totalScore: 58,
    policyOverview: "광주은행 디지털전략부 AI 정책은 AI 활용 범위와 기본 사용 절차를 정의하고 있으나, 실행 승인·Prompt 관리·로그 보존·위험평가 기준은 별도 통제로 분리되어 있지 않습니다.",
    executiveSummary: "광주은행 디지털전략부 AI 정책은 AI 사용 절차는 정의되어 있으나 Prompt 관리, AI 승인, 위험평가, 로그 관리, 개인정보 통제가 부족합니다.\n\n우선적으로 AI 실행 승인, Prompt Logging, AI Risk Review를 도입하고 외부 LLM 사용 승인 기준을 명확히 할 것을 권장합니다.",
    domainScores: [
      { domain: "STRATEGIC_GOVERNANCE", label: "AI 승인 절차", score: 54, maxScore: 100 },
      { domain: "AI_RISK_MANAGEMENT", label: "AI Risk Review", score: 50, maxScore: 100 },
      { domain: "PRIVACY_DATA_PROTECTION", label: "개인정보 보호", score: 62, maxScore: 100 },
      { domain: "MODEL_GOVERNANCE_HUMAN_OVERSIGHT", label: "Prompt Logging", score: 45, maxScore: 100 },
      { domain: "FINANCIAL_ACTIONS", label: "외부 AI 사용관리", score: 66, maxScore: 100 },
    ],
    priorityRisks: [
      { domain: "STRATEGIC_GOVERNANCE", label: "AI 승인 절차", score: 54, description: "업무별 AI 사용 승인권자와 예외 승인 기준이 정책에 충분히 분리되어 있지 않습니다." },
      { domain: "MODEL_GOVERNANCE_HUMAN_OVERSIGHT", label: "Prompt Logging", score: 45, description: "입력 Prompt, 출력 결과, 사용자, 목적을 감사 가능한 형태로 보존하는 기준이 필요합니다." },
      { domain: "AI_RISK_MANAGEMENT", label: "AI Risk Review", score: 50, description: "신규 AI 사용 전 위험등급 산정과 사후 재검토 절차가 약합니다." },
      { domain: "PRIVACY_DATA_PROTECTION", label: "개인정보 보호", score: 62, description: "개인정보·고객정보 입력 제한과 비식별 처리 기준을 강화해야 합니다." },
      { domain: "FINANCIAL_ACTIONS", label: "외부 AI 사용관리", score: 66, description: "외부 LLM 사용 신청, 승인, 사용 범위 기록 체계가 필요합니다." },
    ],
    recommendedActions: [
      { label: "30 Days", actions: ["Prompt Logging 도입", "AI 사용 이력 저장", "외부 LLM 승인 절차 초안 수립"] },
      { label: "90 Days", actions: ["AI 승인 Workflow 구축", "AI Risk Register 작성", "개인정보 입력 제한 정책 배포"] },
      { label: "180 Days", actions: ["정기 AI Risk Review 운영", "감사 증적 리포트 자동화", "부서별 AI 통제 책임자 지정"] },
    ],
    standardsAlignment: [],
    explanations: [],
    gapAnalysis: ["Prompt와 출력 결과에 대한 보존기간·접근권한 정의 부족", "고위험 AI 사용 전 승인 및 위험평가 단계 부족", "외부 AI 서비스 사용 현황을 중앙에서 추적하는 통제 부족"],
  },
  "OO은행_AI_정책.pdf": {
    ...base,
    organizationName: "OO은행",
    policySource: "OO은행_AI_정책.pdf",
    totalScore: 64,
    policyOverview: "OO은행 AI 정책은 부서별 AI 활용 원칙과 개인정보 입력 제한을 포함하지만, 승인 이력과 모델·Prompt 변경관리의 감사 추적성이 제한적입니다.",
    executiveSummary: "OO은행 AI 정책은 개인정보 보호 원칙과 AI 사용 제한 사항은 비교적 명확하지만 승인 이력, Prompt 변경관리, 모델 사용 목적별 위험등급 관리가 미흡합니다.\n\nAI Risk Register와 승인 Workflow를 연결하고 감사 대응 로그를 표준화할 것을 권장합니다.",
    domainScores: [
      { domain: "STRATEGIC_GOVERNANCE", label: "AI 승인 절차", score: 62, maxScore: 100 },
      { domain: "AI_RISK_MANAGEMENT", label: "AI Risk Review", score: 58, maxScore: 100 },
      { domain: "PRIVACY_DATA_PROTECTION", label: "개인정보 보호", score: 74, maxScore: 100 },
      { domain: "MODEL_GOVERNANCE_HUMAN_OVERSIGHT", label: "Prompt Logging", score: 52, maxScore: 100 },
      { domain: "FINANCIAL_ACTIONS", label: "외부 AI 사용관리", score: 70, maxScore: 100 },
    ],
    priorityRisks: [
      { domain: "MODEL_GOVERNANCE_HUMAN_OVERSIGHT", label: "Prompt Logging", score: 52, description: "Prompt 변경 이력과 업무 목적별 사용 근거를 감사 증적으로 남기는 체계가 필요합니다." },
      { domain: "AI_RISK_MANAGEMENT", label: "AI Risk Review", score: 58, description: "AI 사용 유형별 위험등급 기준과 재평가 주기를 명문화해야 합니다." },
      { domain: "STRATEGIC_GOVERNANCE", label: "AI 승인 절차", score: 62, description: "승인권자, 승인 조건, 예외 처리 기준을 Workflow로 구현해야 합니다." },
    ],
    recommendedActions: [
      { label: "30 Days", actions: ["AI Risk Register 작성", "Prompt Logging 항목 표준화", "외부 AI 사용 현황 조사"] },
      { label: "90 Days", actions: ["AI 승인 Workflow 구축", "고위험 AI 사용 재검토 절차 도입", "개인정보 통제 체크리스트 운영"] },
      { label: "180 Days", actions: ["감사 대응 리포트 정례화", "AI 정책 예외 승인 대장 운영", "부서별 통제 성숙도 점검"] },
    ],
    standardsAlignment: [],
    explanations: [],
    gapAnalysis: ["승인 이력과 정책 예외 이력의 중앙 관리 부족", "Prompt 변경관리 기준 부족", "위험등급별 재평가 주기 미정의"],
  },
  "OpenEntry_AI_Policy.pdf": {
    ...base,
    organizationName: "OpenEntry",
    policySource: "OpenEntry_AI_Policy.pdf",
    totalScore: 72,
    riskLevel: "Medium Risk",
    regulatoryReadiness: "Ready",
    auditReadiness: "Partially Ready",
    policyOverview: "OpenEntry AI Policy는 AI 사용 목적, 승인 책임, 로그 관리 방향을 포함하고 있어 정책 기반 평가 흐름을 보여주기에 적합한 샘플입니다.",
    executiveSummary: "OpenEntry AI Policy는 AI 승인과 로그 관리 방향이 정의되어 있으나 운영 증적의 표준화와 외부 AI 사용에 대한 위험등급별 통제는 추가 보완이 필요합니다.\n\nAGAF 기반으로 Prompt Logging, Risk Register, 분기별 Control Review를 연결하면 감사 대응 수준을 빠르게 높일 수 있습니다.",
    domainScores: [
      { domain: "STRATEGIC_GOVERNANCE", label: "AI 승인 절차", score: 76, maxScore: 100 },
      { domain: "AI_RISK_MANAGEMENT", label: "AI Risk Review", score: 70, maxScore: 100 },
      { domain: "PRIVACY_DATA_PROTECTION", label: "개인정보 보호", score: 74, maxScore: 100 },
      { domain: "MODEL_GOVERNANCE_HUMAN_OVERSIGHT", label: "Prompt Logging", score: 68, maxScore: 100 },
      { domain: "FINANCIAL_ACTIONS", label: "외부 AI 사용관리", score: 72, maxScore: 100 },
    ],
    priorityRisks: [
      { domain: "MODEL_GOVERNANCE_HUMAN_OVERSIGHT", label: "Prompt Logging", score: 68, description: "로그 항목은 정의되어 있으나 보존기간과 감사 제출 형식을 표준화해야 합니다." },
      { domain: "AI_RISK_MANAGEMENT", label: "AI Risk Review", score: 70, description: "정책 변경 시 Risk Register 업데이트 책임을 명확히 해야 합니다." },
      { domain: "FINANCIAL_ACTIONS", label: "외부 AI 사용관리", score: 72, description: "외부 LLM 승인 절차를 위험등급별로 차등화해야 합니다." },
    ],
    recommendedActions: [
      { label: "30 Days", actions: ["Prompt Logging 보존 기준 확정", "AI Risk Register 템플릿 배포", "외부 AI 승인 양식 정비"] },
      { label: "90 Days", actions: ["분기별 AI Control Review 운영", "감사 증적 패키지 표준화", "정책 예외 승인 기준 확정"] },
      { label: "180 Days", actions: ["AGAF Control Mapping 자동화 준비", "고위험 사용 사례 샘플 감사", "정책 기반 리포트 정례화"] },
    ],
    standardsAlignment: [],
    explanations: [],
    gapAnalysis: ["로그 보존 및 제출 포맷 표준화 필요", "Risk Register 책임자 및 업데이트 주기 명확화 필요", "외부 AI 사용 위험등급별 승인 기준 보완 필요"],
  },
};

export function isPolicySampleFile(value: string): value is PolicySampleFile {
  return policySamples.includes(value as PolicySampleFile);
}

export function getPolicyAssessmentResult(source: string): PolicyAssessmentResult {
  return isPolicySampleFile(source) ? policyResults[source] : policyResults["광주은행_AI_정책.pdf"];
}

function renderSummaryText(summary: string): string {
  return summary.split("\n\n").map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
}

function renderMetric(label: string, value: string, detail = ""): string {
  return `<article class="metric-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>${detail ? `<p>${escapeHtml(detail)}</p>` : ""}</article>`;
}

export function policyAssessmentDashboardHtml(result: PolicyAssessmentResult): string {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>AGAF AI Governance Assessment</title><style>
    :root { color-scheme: dark; --bg: #07111f; --card: #0f1c2e; --panel: #0b1728; --border: #223555; --text: #eaf2ff; --muted: #b8c7dc; --accent: #66d9ef; --good: #8fffcc; --warn: #ffbd59; --risk: #ff6b6b; }
    * { box-sizing: border-box; } body { margin: 0; min-height: 100vh; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: radial-gradient(circle at top left, #164a7d 0, var(--bg) 34rem); color: var(--text); } main { width: min(1180px, calc(100% - 40px)); margin: 0 auto; padding: 44px 0 72px; } header { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 18px; align-items: center; margin-bottom: 22px; } h1 { margin: 0; font-size: clamp(2.2rem, 5vw, 4.6rem); line-height: .95; letter-spacing: -.05em; } h2, h3 { margin: 0; } p { color: var(--muted); line-height: 1.7; } .eyebrow, .section-kicker { color: var(--accent); font-weight: 900; letter-spacing: .14em; text-transform: uppercase; } .header-actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: flex-end; } .back, .summary-button { display: inline-flex; align-items: center; color: var(--text); text-decoration: none; border: 1px solid var(--border); border-radius: 14px; padding: 12px 16px; font: inherit; font-weight: 900; background: rgba(102,217,239,.08); cursor: pointer; } .summary-button { border-color: rgba(102,217,239,.5); color: var(--accent); } .dashboard-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 18px; } section { border: 1px solid var(--border); border-radius: 28px; background: rgba(15, 28, 46, .92); box-shadow: 0 22px 60px rgba(0,0,0,.28); padding: 24px; } .hero { grid-column: 1 / -1; display: grid; grid-template-columns: 1.1fr 1.9fr; gap: 18px; padding: 0; border: 0; background: transparent; box-shadow: none; } .score-panel, .summary-panel { border: 1px solid var(--border); border-radius: 30px; padding: 30px; background: linear-gradient(145deg, rgba(102,217,239,.16), rgba(11,23,40,.92)); box-shadow: 0 24px 70px rgba(0,0,0,.32); } .score-panel .label { color: var(--accent); font-weight: 900; text-transform: uppercase; letter-spacing: .14em; } .score { margin: 18px 0 10px; font-size: clamp(3.7rem, 9vw, 7rem); line-height: .9; font-weight: 950; letter-spacing: -.07em; } .score small { color: var(--muted); font-size: .38em; letter-spacing: -.03em; } .risk-badge { display: inline-flex; align-items: center; margin-top: 12px; padding: 10px 14px; border-radius: 999px; background: rgba(255,189,89,.16); color: var(--warn); border: 1px solid rgba(255,189,89,.46); font-weight: 900; } .source { margin-top: 16px; padding: 14px; border: 1px solid rgba(184,199,220,.2); border-radius: 16px; background: rgba(7,17,31,.38); } .source span { display: block; color: var(--accent); font-size: .78rem; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; } .source strong { display: block; margin-top: 6px; } .summary-panel h2 { margin: 8px 0 14px; font-size: clamp(1.7rem, 3vw, 2.4rem); } .metrics { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; } .metric-card { min-height: 150px; border: 1px solid var(--border); border-radius: 24px; background: linear-gradient(145deg, rgba(143,255,204,.1), rgba(11,23,40,.9)); padding: 22px; } .metric-card span { color: var(--muted); font-size: .82rem; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; } .metric-card strong { display: block; margin-top: 16px; font-size: clamp(2.1rem, 5vw, 4rem); line-height: 1; } .metric-card p { margin: 12px 0 0; } .domains { grid-column: span 7; } .risks { grid-column: span 5; } .actions, .gaps { grid-column: 1 / -1; } .domains h2, .risks h2, .actions h2, .gaps h2 { margin: 6px 0 18px; font-size: 1.35rem; } .domain-row { display: grid; gap: 10px; padding: 16px 0; border-top: 1px solid rgba(184,199,220,.16); } .domain-row:first-of-type { border-top: 0; padding-top: 0; } .domain-row > div:first-child { display: flex; justify-content: space-between; gap: 16px; color: var(--muted); } .domain-row strong, .risks strong { color: var(--text); } .progress { height: 14px; overflow: hidden; border-radius: 999px; background: rgba(184,199,220,.16); } .progress span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--accent), var(--good)); } ol, ul { margin: 0; padding-left: 24px; } li { margin: 0 0 14px; color: var(--muted); line-height: 1.55; } li::marker { color: var(--accent); font-weight: 900; } .risks li span { display: block; margin: 4px 0; color: var(--warn); font-weight: 900; } .action-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; } .action-grid article { padding: 20px; border: 1px solid var(--border); border-radius: 20px; background: var(--panel); } .action-grid h3 { margin-bottom: 16px; color: var(--good); font-size: 1.35rem; } @media (max-width: 920px) { .hero, .metrics, .dashboard-grid, .action-grid { grid-template-columns: 1fr; } .domains, .risks, .actions, .gaps, .hero, .metrics { grid-column: 1; } }
  </style></head><body><main><header><div><div class="eyebrow">AGAF Policy-based Assessment MVP v0.4</div><h1>AGAF AI Governance Assessment</h1><p>${escapeHtml(result.organizationName)} AI 정책 평가</p></div><div class="header-actions"><a class="back" href="/demo/assessment">첫 화면으로</a><button class="summary-button" type="button" id="policy-summary-button">Executive Summary</button></div></header><div class="dashboard-grid"><section class="hero"><article class="score-panel"><div class="label">AI Governance Score</div><div class="score">${result.totalScore} <small>/ ${result.maxScore}</small></div><div class="risk-badge">${escapeHtml(result.riskLevel)}</div><div class="source"><span>Policy Source</span><strong>${escapeHtml(result.policySource)}</strong></div></article><article class="summary-panel"><div class="section-kicker">Executive Summary</div><h2>${escapeHtml(result.organizationName)} 정책 기반 평가 요약</h2>${renderSummaryText(result.executiveSummary)}</article></section><section class="metrics">${renderMetric("규제 대응 준비도", result.regulatoryReadiness, "정책 문서 기준 Mock 평가")} ${renderMetric("통제 성숙도", result.controlMaturity, result.maturityLevel.displayName)} ${renderMetric("감사 대응 준비도", result.auditReadiness, `거버넌스 등급 ${result.governanceGrade}`)}</section><section class="domains"><div class="section-kicker">Policy Control Overview</div><h2>정책 통제 항목별 점수</h2>${result.domainScores.map((item) => `<div class="domain-row"><div><strong>${escapeHtml(item.label)}</strong><span>${item.score}%</span></div><div class="progress"><span style="width: ${item.score}%"></span></div></div>`).join("")}</section><section class="risks"><div class="section-kicker">Highest Priority Risks</div><h2>우선 관리 위험</h2><ol>${result.priorityRisks.map((risk) => `<li><strong>${escapeHtml(risk.label)}</strong><span>${risk.score}%</span><p>${escapeHtml(risk.description)}</p></li>`).join("")}</ol></section><section class="gaps"><div class="section-kicker">Gap Analysis</div><h2>정책 분석 Gap</h2><ul>${result.gapAnalysis.map((gap) => `<li>${escapeHtml(gap)}</li>`).join("")}</ul></section><section class="actions"><div class="section-kicker">Recommended Actions</div><h2>권장 실행 계획</h2><div class="action-grid">${result.recommendedActions.map((group) => `<article><h3>${escapeHtml(group.label)}</h3><ul>${group.actions.map((action) => `<li>${escapeHtml(action)}</li>`).join("")}</ul></article>`).join("")}</div></section></div></main><script>document.getElementById("policy-summary-button").addEventListener("click", async () => { const response = await fetch("/assessment/policy/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source: ${JSON.stringify(result.policySource)} }) }); const html = await response.text(); document.open(); document.write(html); document.close(); });</script></body></html>`;
}

function assessmentDate(): string {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(new Date());
}

export function policyAssessmentReportHtml(result: PolicyAssessmentResult): string {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escapeHtml(result.organizationName)} AI 정책 평가보고서</title><style>:root { color-scheme: light; --bg: #eef1f5; --paper: #ffffff; --ink: #172033; --muted: #5d687a; --line: #d7dde7; --navy: #12213a; --blue: #1f4e79; --gold: #a67c00; --red: #9f2f2f; } * { box-sizing: border-box; } body { margin: 0; min-height: 100vh; font-family: Georgia, "Times New Roman", serif; background: var(--bg); color: var(--ink); } .toolbar { position: sticky; top: 0; z-index: 2; display: flex; justify-content: flex-end; gap: 10px; padding: 14px 22px; background: rgba(238,241,245,.96); border-bottom: 1px solid var(--line); } .toolbar a, .toolbar button { border: 1px solid var(--navy); border-radius: 4px; background: var(--navy); color: white; padding: 10px 14px; font: 700 .9rem Arial, sans-serif; text-decoration: none; cursor: pointer; } .toolbar a { background: white; color: var(--navy); } main { width: min(960px, calc(100% - 32px)); margin: 28px auto 42px; } .report { background: var(--paper); border: 1px solid var(--line); box-shadow: 0 18px 45px rgba(18,33,58,.13); padding: clamp(30px, 5vw, 58px); } header { display: grid; grid-template-columns: 1fr auto; gap: 24px; padding-bottom: 24px; border-bottom: 3px solid var(--navy); } .eyebrow { color: var(--blue); font: 800 .78rem Arial, sans-serif; letter-spacing: .16em; text-transform: uppercase; } h1 { margin: 10px 0 0; color: var(--navy); font-size: clamp(2rem, 4.4vw, 3.7rem); line-height: 1.02; letter-spacing: -.03em; } .meta { min-width: 280px; border: 1px solid var(--line); } .meta div { display: flex; justify-content: space-between; gap: 16px; padding: 11px 13px; border-bottom: 1px solid var(--line); font: 700 .88rem Arial, sans-serif; } .meta div:last-child { border-bottom: 0; } .meta span { color: var(--muted); } section { padding: 26px 0; border-bottom: 1px solid var(--line); break-inside: avoid; } h2 { margin: 0 0 18px; color: var(--navy); font: 800 1rem Arial, sans-serif; letter-spacing: .13em; text-transform: uppercase; } p, li { color: var(--muted); line-height: 1.68; } .score-grid, .roadmap { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; } .metric, .roadmap-card, .box { border-left: 4px solid var(--blue); background: #f7f9fc; padding: 14px; } .metric span { display: block; color: var(--muted); font: 800 .76rem Arial, sans-serif; text-transform: uppercase; } .metric strong { display: block; margin-top: 8px; color: var(--navy); font: 900 1.7rem Arial, sans-serif; } .score { color: var(--navy); font: 900 3.2rem Arial, sans-serif; } .narrative p + p { margin-top: 12px; } h3 { color: var(--blue); font: 900 1.1rem Arial, sans-serif; margin: 0 0 10px; } @media print { body { background: white; } .toolbar { display: none; } main { width: 100%; margin: 0; } .report { border: 0; box-shadow: none; padding: 0; } }</style></head><body><nav class="toolbar"><a href="/assessment/policy?source=${encodeURIComponent(result.policySource)}">Dashboard</a><button type="button" onclick="window.print()">Print / Save PDF</button></nav><main><article class="report"><header><div><div class="eyebrow">AGAF AI Governance Assessment</div><h1>${escapeHtml(result.organizationName)} AI 정책 평가보고서</h1></div><div class="meta"><div><span>Policy Source</span><strong>${escapeHtml(result.policySource)}</strong></div><div><span>평가일</span><strong>${escapeHtml(assessmentDate())}</strong></div><div><span>보고서명</span><strong>${escapeHtml(result.organizationName)}_AI정책_평가보고서.pdf</strong></div></div></header><section><h2>Section 1 · 정책 개요</h2><p>${escapeHtml(result.policyOverview)}</p></section><section><h2>Section 2 · 정책 분석 결과</h2>${renderSummaryText(result.executiveSummary)}</section><section><h2>Section 3 · 규제 대응 수준 / AI Governance Score</h2><div class="score-grid"><div class="metric"><span>AI Governance Score</span><strong class="score">${result.totalScore}/${result.maxScore}</strong></div><div class="metric"><span>Regulatory Readiness</span><strong>${escapeHtml(result.regulatoryReadiness)}</strong></div><div class="metric"><span>Audit Readiness</span><strong>${escapeHtml(result.auditReadiness)}</strong></div></div></section><section><h2>Section 4 · Gap Analysis</h2><ul>${result.gapAnalysis.map((gap) => `<li>${escapeHtml(gap)}</li>`).join("")}</ul></section><section><h2>Section 5 · Recommended Actions</h2><ul>${result.recommendedActions.flatMap((group) => group.actions).map((action) => `<li>${escapeHtml(action)}</li>`).join("")}</ul></section><section><h2>Section 6 · Roadmap</h2><div class="roadmap">${result.recommendedActions.map((group) => `<div class="roadmap-card"><h3>${escapeHtml(group.label)}</h3><ul>${group.actions.map((action) => `<li>${escapeHtml(action)}</li>`).join("")}</ul></div>`).join("")}</div></section></article></main></body></html>`;
}
