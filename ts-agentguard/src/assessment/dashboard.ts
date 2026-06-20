import { AssessmentResult, DomainScore, RecommendedActionGroup, PriorityRisk } from "./types";

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

export function topRisksForDashboard(result: AssessmentResult): PriorityRisk[] {
  return result.priorityRisks;
}

function renderMetric(label: string, value: string, detail = ""): string {
  return `<article class="metric-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>${detail ? `<p>${escapeHtml(detail)}</p>` : ""}</article>`;
}

function renderDomainScore(domainScore: DomainScore): string {
  return `<div class="domain-row">
    <div><strong>${escapeHtml(domainScore.label)}</strong><span>${domainScore.score}%</span></div>
    <div class="progress" aria-label="${escapeHtml(domainScore.label)} score ${domainScore.score} out of ${domainScore.maxScore}"><span style="width: ${domainScore.score}%"></span></div>
  </div>`;
}

function renderPriorityRisk(risk: PriorityRisk): string {
  return `<li><strong>${escapeHtml(risk.label)}</strong><span>${risk.score}%</span><p>${escapeHtml(risk.description)}</p></li>`;
}

function renderActionGroup(group: RecommendedActionGroup): string {
  return `<article>
    <h3>${escapeHtml(group.label)}</h3>
    <ul>${group.actions.map((action) => `<li>${escapeHtml(action)}</li>`).join("")}</ul>
  </article>`;
}

function renderSummaryText(summary: string): string {
  return summary.split("\n\n").map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
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
    body { margin: 0; min-height: 100vh; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: radial-gradient(circle at top left, #164a7d 0, var(--bg) 34rem); color: var(--text); }
    main { width: min(1180px, calc(100% - 40px)); margin: 0 auto; padding: 44px 0 72px; }
    header { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 18px; align-items: center; margin-bottom: 22px; }
    h1 { margin: 0; font-size: clamp(2.2rem, 5vw, 4.6rem); line-height: .95; letter-spacing: -.05em; }
    h2, h3 { margin: 0; }
    p { color: var(--muted); line-height: 1.7; }
    .eyebrow, .section-kicker { color: var(--accent); font-weight: 900; letter-spacing: .14em; text-transform: uppercase; }
    .back { color: var(--text); text-decoration: none; border: 1px solid var(--border); border-radius: 14px; padding: 12px 16px; font-weight: 900; }
    .dashboard-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 18px; }
    section { border: 1px solid var(--border); border-radius: 28px; background: rgba(15, 28, 46, .92); box-shadow: 0 22px 60px rgba(0,0,0,.28); padding: 24px; }
    .hero { grid-column: 1 / -1; display: grid; grid-template-columns: 1.1fr 1.9fr; gap: 18px; padding: 0; border: 0; background: transparent; box-shadow: none; }
    .score-panel, .summary-panel { border: 1px solid var(--border); border-radius: 30px; padding: 30px; background: linear-gradient(145deg, rgba(102,217,239,.16), rgba(11,23,40,.92)); box-shadow: 0 24px 70px rgba(0,0,0,.32); }
    .score-panel .label { color: var(--accent); font-weight: 900; text-transform: uppercase; letter-spacing: .14em; }
    .score { margin: 18px 0 10px; font-size: clamp(3.7rem, 9vw, 7rem); line-height: .9; font-weight: 950; letter-spacing: -.07em; }
    .score small { color: var(--muted); font-size: .38em; letter-spacing: -.03em; }
    .risk-badge { display: inline-flex; align-items: center; margin-top: 12px; padding: 10px 14px; border-radius: 999px; background: rgba(255,189,89,.16); color: var(--warn); border: 1px solid rgba(255,189,89,.46); font-weight: 900; }
    .summary-panel h2 { margin: 8px 0 14px; font-size: clamp(1.7rem, 3vw, 2.4rem); }
    .metrics { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
    .metric-card { min-height: 150px; border: 1px solid var(--border); border-radius: 24px; background: linear-gradient(145deg, rgba(143,255,204,.1), rgba(11,23,40,.9)); padding: 22px; }
    .metric-card span { color: var(--muted); font-size: .82rem; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; }
    .metric-card strong { display: block; margin-top: 16px; font-size: clamp(2.1rem, 5vw, 4rem); line-height: 1; }
    .metric-card p { margin: 12px 0 0; }
    .domains { grid-column: span 7; }
    .risks { grid-column: span 5; }
    .domains h2, .risks h2, .actions h2 { margin: 6px 0 18px; font-size: 1.35rem; }
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
    .actions { grid-column: 1 / -1; }
    .action-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .action-grid article { padding: 20px; border: 1px solid var(--border); border-radius: 20px; background: var(--panel); }
    .action-grid h3 { margin-bottom: 16px; color: var(--good); font-size: 1.35rem; }
    @media (max-width: 920px) { .hero, .metrics, .dashboard-grid, .action-grid { grid-template-columns: 1fr; } .domains, .risks, .actions, .hero, .metrics { grid-column: 1; } }
  </style>
</head>
<body>
  <main>
    <header>
      <div><div class="eyebrow">AGAF Assessment MVP v0.3</div><h1>Executive Dashboard</h1><p>현재 5개 Domain과 기존 질문 응답만으로 AI 거버넌스 점수, 위험등급, 규제 준비도, 실행계획을 자동 생성합니다.</p></div>
      <a class="back" href="/assessment/start">Run Again</a>
    </header>
    <div class="dashboard-grid">
      <section class="hero" aria-labelledby="summary-title">
        <article class="score-panel">
          <div class="label">AI Governance Score</div>
          <div class="score">${result.totalScore} <small>/ ${result.maxScore}</small></div>
          <div class="risk-badge">${escapeHtml(result.riskLevel)}</div>
        </article>
        <article class="summary-panel">
          <div class="section-kicker">Executive Summary</div>
          <h2 id="summary-title">경영진 요약</h2>
          ${renderSummaryText(result.executiveSummary)}
        </article>
      </section>
      <section class="metrics" aria-label="Executive readiness metrics">
        ${renderMetric("Regulatory Readiness", result.regulatoryReadiness, "현재 5개 Domain 기반 임시 계산")}
        ${renderMetric("Control Maturity", result.controlMaturity, result.maturityLevel.displayName)}
        ${renderMetric("Audit Readiness", result.auditReadiness, `Governance Grade ${result.governanceGrade}`)}
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
        <h2 id="actions-title">30 / 90 / 180 실행 계획</h2>
        <div class="action-grid">${result.recommendedActions.map(renderActionGroup).join("")}</div>
      </section>
    </div>
  </main>
</body>
</html>`;
}
