import { AssessmentResult, DomainScore } from "./types";

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

const riskMessages: Record<DomainScore["domain"], string> = {
  FINANCIAL_ACTIONS: "AI가 승인 없이 금전 관련 행동을 할 위험",
  AI_RISK_MANAGEMENT: "AI가 회사 정책을 위반하거나 잘못된 결정을 내릴 위험",
  PRIVACY_DATA_PROTECTION: "AI가 고객정보나 회사 기밀을 외부로 보낼 위험",
  MODEL_GOVERNANCE_HUMAN_OVERSIGHT: "중요한 AI 결과가 사람의 검토 없이 사용될 위험",
  STRATEGIC_GOVERNANCE: "경영진 책임, 규제 대응, 개선 계획이 불명확할 위험",
};

const actionPlans: Record<"30 Days" | "90 Days" | "180 Days", string[]> = {
  "30 Days": [
    "AI 사용 원칙과 금지 정보를 전 직원에게 안내합니다.",
    "금전, 고객정보, 중요 의사결정에 대한 사전 승인 기준을 정합니다.",
    "현재 사용 중인 주요 AI 업무를 목록화합니다.",
  ],
  "90 Days": [
    "고위험 AI 업무에 사람 검토와 책임자 승인을 적용합니다.",
    "고객정보 보호, 기록 보관, 사고 대응 절차를 정비합니다.",
    "경영진 보고용 월간 AI 위험 점검 체계를 시작합니다.",
  ],
  "180 Days": [
    "정기 감사와 규제 대응 증적을 관리합니다.",
    "AI 거버넌스 성과 지표를 사업 운영 회의에 포함합니다.",
    "부서별 개선 과제를 재평가하고 다음 반기 계획을 확정합니다.",
  ],
};

export function topRisksForDashboard(result: AssessmentResult): string[] {
  const weakDomains = [...result.domainScores].sort((left, right) => left.score - right.score).slice(0, 3);
  if (weakDomains.every((domain) => domain.score >= 85)) return ["현재 즉시 조치가 필요한 주요 위험은 낮습니다."];
  return weakDomains.map((domain) => riskMessages[domain.domain]);
}

function renderSummaryCard(label: string, value: string, className = ""): string {
  return `<article class="summary-card ${className}"><p>${escapeHtml(label)}</p><strong>${escapeHtml(value)}</strong></article>`;
}

function renderDomainScore(domainScore: DomainScore): string {
  return `<div class="domain-row">
    <div><strong>${escapeHtml(domainScore.label)}</strong><span>${domainScore.score} / ${domainScore.maxScore}</span></div>
    <div class="progress" aria-label="${escapeHtml(domainScore.label)} score ${domainScore.score} out of ${domainScore.maxScore}"><span style="width: ${domainScore.score}%"></span></div>
  </div>`;
}

function renderNumberedList(items: string[]): string {
  return `<ol>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`;
}

function renderActionPlans(): string {
  return `<section class="actions" aria-labelledby="actions-title">
    <div class="section-kicker">Recommended Actions</div>
    <h2 id="actions-title">권장 실행 계획</h2>
    <div class="action-grid">${Object.entries(actionPlans).map(([period, items]) => `<article><span>${escapeHtml(period)}</span>${renderNumberedList(items)}</article>`).join("")}</div>
  </section>`;
}

export function assessmentDashboardHtml(result: AssessmentResult): string {
  const topRisks = topRisksForDashboard(result);

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AGAF Executive Dashboard</title>
  <style>
    :root { color-scheme: dark; --bg: #07111f; --card: #0f1c2e; --panel: #0b1728; --border: #223555; --text: #eaf2ff; --muted: #b8c7dc; --accent: #66d9ef; --good: #8fffcc; --warn: #ffbd59; --risk: #ff6b6b; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: radial-gradient(circle at top left, #12345a 0, var(--bg) 34rem); color: var(--text); }
    main { width: min(1160px, calc(100% - 40px)); margin: 0 auto; padding: 52px 0 72px; }
    header { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 18px; align-items: end; margin-bottom: 24px; }
    h1 { margin: 0; font-size: clamp(2.4rem, 6vw, 4.9rem); line-height: .95; letter-spacing: -.05em; }
    h2 { margin: 0 0 18px; font-size: 1.35rem; }
    p { color: var(--muted); line-height: 1.7; }
    .eyebrow, .section-kicker { color: var(--accent); font-weight: 900; letter-spacing: .14em; text-transform: uppercase; }
    .dashboard-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 18px; }
    section { border: 1px solid var(--border); border-radius: 26px; background: rgba(15, 28, 46, .9); box-shadow: 0 22px 60px rgba(0,0,0,.28); padding: 24px; }
    .summary, .actions { grid-column: 1 / -1; }
    .summary-cards { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; }
    .summary-card { min-height: 132px; padding: 22px; border: 1px solid var(--border); border-radius: 22px; background: linear-gradient(145deg, rgba(102,217,239,.12), rgba(11,23,40,.88)); }
    .summary-card p { margin: 0 0 18px; font-size: .82rem; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; }
    .summary-card strong { display: block; font-size: clamp(1.35rem, 3vw, 2.7rem); line-height: 1.05; }
    .score-card { border-color: var(--warn); background: linear-gradient(145deg, rgba(255,189,89,.2), rgba(11,23,40,.9)); }
    .domains { grid-column: span 7; }
    .risks { grid-column: span 5; }
    .domain-row { display: grid; gap: 10px; padding: 16px 0; border-top: 1px solid rgba(184,199,220,.16); }
    .domain-row:first-of-type { border-top: 0; padding-top: 0; }
    .domain-row > div:first-child { display: flex; justify-content: space-between; gap: 16px; color: var(--muted); }
    .domain-row strong { color: var(--text); }
    .progress { height: 14px; overflow: hidden; border-radius: 999px; background: rgba(184,199,220,.16); }
    .progress span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--accent), var(--good)); }
    ol { margin: 0; padding-left: 24px; }
    li { margin: 0 0 14px; color: var(--muted); line-height: 1.55; }
    li::marker { color: var(--accent); font-weight: 900; }
    .action-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .action-grid article { padding: 18px; border: 1px solid var(--border); border-radius: 18px; background: var(--panel); }
    .action-grid span { display: block; margin-bottom: 14px; color: var(--good); font-size: 1.3rem; font-weight: 900; }
    .back { color: var(--text); text-decoration: none; border: 1px solid var(--border); border-radius: 14px; padding: 12px 16px; font-weight: 900; }
    @media (max-width: 920px) { .summary-cards, .dashboard-grid, .action-grid { grid-template-columns: 1fr; } .domains, .risks, .summary, .actions { grid-column: 1; } }
  </style>
</head>
<body>
  <main>
    <header>
      <div><div class="eyebrow">AGAF Assessment MVP v0.1</div><h1>Executive Dashboard</h1><p>25개 질문 응답을 기반으로 AI 거버넌스 점수, 주요 위험, 실행 우선순위를 보여줍니다.</p></div>
      <a class="back" href="/assessment/start">Run Again</a>
    </header>
    <div class="dashboard-grid">
      <section class="summary" aria-labelledby="summary-title">
        <h2 id="summary-title">Executive Summary</h2>
        <div class="summary-cards">
          ${renderSummaryCard("AI Governance Score", `${result.totalScore} / ${result.maxScore}`, "score-card")}
          ${renderSummaryCard("Risk Level", result.riskLevel)}
          ${renderSummaryCard("Regulatory Readiness", result.regulatoryReadiness)}
          ${renderSummaryCard("Control Maturity", result.controlMaturity)}
          ${renderSummaryCard("Audit Readiness", result.auditReadiness)}
          ${renderSummaryCard("Governance Grade", result.governanceGrade)}
        </div>
      </section>
      <section class="domains" aria-labelledby="domain-title">
        <div class="section-kicker">5 Domain Risk Overview</div>
        <h2 id="domain-title">영역별 위험 현황</h2>
        ${result.domainScores.map(renderDomainScore).join("")}
      </section>
      <section class="risks" aria-labelledby="risks-title">
        <div class="section-kicker">Highest Priority Risks</div>
        <h2 id="risks-title">우선 관리 위험</h2>
        ${renderNumberedList(topRisks)}
      </section>
      ${renderActionPlans()}
    </div>
  </main>
</body>
</html>`;
}
