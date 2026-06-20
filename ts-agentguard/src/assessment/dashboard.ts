import { AssessmentResult, DomainScore, RecommendedActionGroup, PriorityRisk } from "./types";

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

export function topRisksForDashboard(result: AssessmentResult): PriorityRisk[] {
  return result.priorityRisks;
}

function renderSummaryCard(label: string, value: string, className = ""): string {
  return `<article class="summary-card ${className}"><p>${escapeHtml(label)}</p><strong>${escapeHtml(value)}</strong></article>`;
}

function renderDomainScore(domainScore: DomainScore): string {
  return `<div class="domain-row">
    <div><strong>${escapeHtml(domainScore.label)}</strong><span>${domainScore.score}점 / ${domainScore.maxScore}</span></div>
    <div class="progress" aria-label="${escapeHtml(domainScore.label)} score ${domainScore.score} out of ${domainScore.maxScore}"><span style="width: ${domainScore.score}%"></span></div>
  </div>`;
}

function renderPriorityRisk(risk: PriorityRisk): string {
  return `<li><strong>${escapeHtml(risk.label)}</strong><span>${risk.score}점</span><p>${escapeHtml(risk.description)}</p></li>`;
}

function renderActionGroup(group: RecommendedActionGroup): string {
  return `<article>
    <span>${escapeHtml(group.label)}</span>
    <ul>${group.actions.map((action) => `<li>${escapeHtml(action)}</li>`).join("")}</ul>
  </article>`;
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
    .domain-row strong, .risks strong { color: var(--text); }
    .progress { height: 14px; overflow: hidden; border-radius: 999px; background: rgba(184,199,220,.16); }
    .progress span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--accent), var(--good)); }
    ol, ul { margin: 0; padding-left: 24px; }
    li { margin: 0 0 14px; color: var(--muted); line-height: 1.55; }
    li::marker { color: var(--accent); font-weight: 900; }
    .risks li span { display: block; margin: 4px 0; color: var(--warn); font-weight: 900; }
    .risks li p { margin: 0; }
    .action-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .action-grid article { padding: 18px; border: 1px solid var(--border); border-radius: 18px; background: var(--panel); }
    .action-grid span { display: block; margin-bottom: 14px; color: var(--good); font-size: 1.2rem; font-weight: 900; }
    .back { color: var(--text); text-decoration: none; border: 1px solid var(--border); border-radius: 14px; padding: 12px 16px; font-weight: 900; }
    @media (max-width: 920px) { .summary-cards, .dashboard-grid, .action-grid { grid-template-columns: 1fr; } .domains, .risks, .summary, .actions { grid-column: 1; } }
  </style>
</head>
<body>
  <main>
    <header>
      <div><div class="eyebrow">AGAF Assessment MVP v0.2</div><h1>Executive Dashboard</h1><p>25개 질문 응답을 기반으로 AI 거버넌스 점수, 위험등급, 우선 위험, 권고사항을 자동 생성합니다.</p></div>
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
        <div class="section-kicker">5 Domain Overview</div>
        <h2 id="domain-title">영역별 점수 현황</h2>
        ${result.domainScores.map(renderDomainScore).join("")}
      </section>
      <section class="risks" aria-labelledby="risks-title">
        <div class="section-kicker">Highest Priority Risks</div>
        <h2 id="risks-title">우선 관리 위험</h2>
        <ol>${topRisks.map(renderPriorityRisk).join("")}</ol>
      </section>
      <section class="actions" aria-labelledby="actions-title">
        <div class="section-kicker">Recommended Actions</div>
        <h2 id="actions-title">권장 실행 계획</h2>
        <div class="action-grid">${result.recommendedActions.map(renderActionGroup).join("")}</div>
      </section>
    </div>
  </main>
</body>
</html>`;
}
