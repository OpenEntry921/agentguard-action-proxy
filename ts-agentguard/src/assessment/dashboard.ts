import { AssessmentResult, DomainScore } from "./types";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const riskMessages: Record<DomainScore["domain"], string> = {
  AI_USAGE: "No AI usage policy",
  DATA_PROTECTION: "Sensitive data handling not defined",
  ACCESS_CONTROL: "Approval and access control workflow is incomplete",
  AUDIT_TRACEABILITY: "Audit trail and traceability are not ready",
  AGENT_RISK: "No runtime control before agent execution",
};

const recommendationMessages: Record<DomainScore["domain"], string> = {
  AI_USAGE: "Establish AI usage policy",
  DATA_PROTECTION: "Define sensitive data handling rules",
  ACCESS_CONTROL: "Implement approval workflow",
  AUDIT_TRACEABILITY: "Prepare audit log retention and traceability model",
  AGENT_RISK: "Prepare AgentGuard runtime control PoC",
};

function lowestDomainScores(result: AssessmentResult): DomainScore[] {
  return [...result.domainScores].sort((left, right) => left.score - right.score || left.label.localeCompare(right.label));
}

export function topRisksForDashboard(result: AssessmentResult): string[] {
  return lowestDomainScores(result).slice(0, 3).map((domainScore) => riskMessages[domainScore.domain]);
}

export function recommendationsForDashboard(result: AssessmentResult): string[] {
  const priorityRecommendations = lowestDomainScores(result).map((domainScore) => recommendationMessages[domainScore.domain]);
  const baselineRecommendations = [
    "Establish AI usage policy",
    "Define sensitive data handling rules",
    "Implement approval workflow",
    "Prepare AgentGuard runtime control PoC",
  ];

  return [...new Set([...priorityRecommendations, ...baselineRecommendations])].slice(0, 4);
}

function renderSummaryCard(label: string, value: string): string {
  return `<article class="summary-card"><p>${escapeHtml(label)}</p><strong>${escapeHtml(value)}</strong></article>`;
}

function renderDomainScore(domainScore: DomainScore): string {
  const percent = Math.max(0, Math.min(100, Math.round((domainScore.score / domainScore.maxScore) * 100)));
  return `<div class="domain-row">
    <div>
      <strong>${escapeHtml(domainScore.label)}</strong>
      <span>${domainScore.score} / ${domainScore.maxScore}</span>
    </div>
    <div class="progress" aria-label="${escapeHtml(domainScore.label)} score ${domainScore.score} out of ${domainScore.maxScore}">
      <span style="width: ${percent}%"></span>
    </div>
  </div>`;
}

function renderNumberedList(items: string[]): string {
  return `<ol>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`;
}

export function assessmentDashboardHtml(result: AssessmentResult): string {
  const topRisks = topRisksForDashboard(result);
  const recommendations = recommendationsForDashboard(result);

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AI Governance Readiness Dashboard</title>
  <style>
    :root { color-scheme: dark; --bg: #07111f; --card: #0f1c2e; --panel: #0b1728; --border: #223555; --text: #eaf2ff; --muted: #b8c7dc; --accent: #66d9ef; --accent2: #8fffcc; --risk: #ff6b6b; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: radial-gradient(circle at top left, #12345a 0, var(--bg) 34rem); color: var(--text); }
    main { width: min(1120px, calc(100% - 40px)); margin: 0 auto; padding: 56px 0 72px; }
    header { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 18px; align-items: end; margin-bottom: 24px; }
    h1 { margin: 0; font-size: clamp(2.2rem, 6vw, 4.8rem); line-height: .95; letter-spacing: -.05em; }
    h2 { margin: 0 0 18px; font-size: 1.35rem; }
    p { color: var(--muted); line-height: 1.7; }
    .eyebrow { color: var(--accent); font-weight: 900; letter-spacing: .14em; text-transform: uppercase; }
    .dashboard-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 18px; }
    section { border: 1px solid var(--border); border-radius: 26px; background: rgba(15, 28, 46, .9); box-shadow: 0 22px 60px rgba(0,0,0,.28); padding: 24px; }
    .summary { grid-column: 1 / -1; }
    .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .summary-card { min-height: 132px; padding: 22px; border: 1px solid var(--border); border-radius: 22px; background: linear-gradient(145deg, rgba(102,217,239,.12), rgba(11,23,40,.88)); }
    .summary-card p { margin: 0 0 18px; font-size: .86rem; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; }
    .summary-card strong { display: block; font-size: clamp(1.7rem, 4vw, 3rem); line-height: 1; }
    .domains { grid-column: span 7; }
    .insights { grid-column: span 5; display: grid; gap: 18px; background: transparent; border: 0; box-shadow: none; padding: 0; }
    .domain-row { display: grid; gap: 10px; padding: 16px 0; border-top: 1px solid rgba(184,199,220,.16); }
    .domain-row:first-of-type { border-top: 0; padding-top: 0; }
    .domain-row > div:first-child { display: flex; justify-content: space-between; gap: 16px; color: var(--muted); }
    .domain-row strong { color: var(--text); }
    .progress { height: 14px; overflow: hidden; border-radius: 999px; background: rgba(184,199,220,.16); }
    .progress span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--accent), var(--accent2)); }
    ol { margin: 0; padding-left: 24px; color: var(--text); }
    li { margin: 0 0 14px; color: var(--muted); line-height: 1.55; }
    li::marker { color: var(--accent); font-weight: 900; }
    .framework { grid-column: 1 / -1; text-align: center; }
    .flow { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 12px; margin: 20px 0; }
    .step { padding: 13px 18px; border: 1px solid var(--border); border-radius: 999px; background: var(--panel); font-weight: 900; }
    .current { border-color: var(--accent); box-shadow: 0 0 0 4px rgba(102,217,239,.12); }
    .arrow { color: var(--accent); font-size: 1.45rem; }
    .stage { margin: 0; color: var(--accent2); font-weight: 900; }
    .back { color: var(--text); text-decoration: none; border: 1px solid var(--border); border-radius: 14px; padding: 12px 16px; font-weight: 900; }
    @media (max-width: 860px) { .summary-cards, .dashboard-grid { grid-template-columns: 1fr; } .domains, .insights, .summary, .framework { grid-column: 1; } .flow { flex-direction: column; } .arrow { transform: rotate(90deg); } }
  </style>
</head>
<body>
  <main>
    <header>
      <div><div class="eyebrow">OpenEntry Assessment</div><h1>AI Governance Readiness Dashboard</h1><p>20개 질문 응답을 기반으로 거버넌스 준비도, 주요 리스크, 다음 실행 과제를 보여줍니다.</p></div>
      <a class="back" href="/assessment/start">Run Again</a>
    </header>
    <div class="dashboard-grid">
      <section class="summary" aria-labelledby="summary-title">
        <h2 id="summary-title">Summary Cards</h2>
        <div class="summary-cards">
          ${renderSummaryCard("Total Score", `${result.totalScore} / ${result.maxScore}`)}
          ${renderSummaryCard("Risk Level", result.riskLevel)}
          ${renderSummaryCard("Maturity", result.maturityLevel.displayName)}
        </div>
      </section>
      <section class="domains" aria-labelledby="domain-title">
        <h2 id="domain-title">Domain Scores</h2>
        ${result.domainScores.map(renderDomainScore).join("")}
      </section>
      <div class="insights">
        <section aria-labelledby="risks-title"><h2 id="risks-title">Top Risks</h2>${renderNumberedList(topRisks)}</section>
        <section aria-labelledby="recommendations-title"><h2 id="recommendations-title">Recommendations</h2>${renderNumberedList(recommendations)}</section>
      </div>
      <section class="framework" aria-labelledby="framework-title">
        <h2 id="framework-title">OpenEntry Framework</h2>
        <div class="flow"><span class="step current">Assessment</span><span class="arrow">↓</span><span class="step">Governance Design</span><span class="arrow">↓</span><span class="step">Policy Library</span><span class="arrow">↓</span><span class="step">AgentGuard Runtime Control</span></div>
        <p class="stage">Current Stage: Assessment</p>
      </section>
    </div>
  </main>
</body>
</html>`;
}
