import { AssessmentResult, PriorityRisk, RecommendedActionGroup } from "./types";

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function stripDomainCode(label: string): string {
  return label.replace(/^D\d+\s+/, "");
}

function assessmentDate(): string {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(new Date());
}

function executiveSummaryFor(result: AssessmentResult): string {
  const riskAreas = result.priorityRisks.map((risk) => stripDomainCode(risk.label));
  const primaryAreas = riskAreas.slice(0, 3);
  const riskSentence = primaryAreas.length > 1
    ? `${primaryAreas.slice(0, -1).join(", ")}, and ${primaryAreas.at(-1)}`
    : primaryAreas[0] ?? "core AI governance";

  if (result.totalScore <= 49) {
    return `Your organization is actively adopting AI, but the current governance posture shows material exposure in ${riskSentence}. Immediate executive action is recommended before expanding AI-enabled business processes. Prioritize clear ownership, human approval for high-impact actions, and stronger protection of sensitive information.`;
  }

  if (result.totalScore <= 69) {
    return `Your organization has started building AI governance practices, but important control gaps remain in ${riskSentence}. Near-term improvements will reduce business, compliance, and reputational risk as AI usage scales. Focus on the recommended roadmap to convert partial practices into repeatable executive controls.`;
  }

  if (result.totalScore <= 84) {
    return `Your organization has a managed AI governance foundation with selected improvement areas in ${riskSentence}. Continued executive attention will help standardize practices and reduce residual risk. The recommended roadmap focuses on strengthening consistency across teams and high-impact AI use cases.`;
  }

  return `Your organization demonstrates a strong AI governance posture. Remaining improvements should focus on maintaining executive visibility, consistent assurance, and continuous review as AI adoption expands. The recommended roadmap supports mature governance at enterprise scale.`;
}

function renderRisk(risk: PriorityRisk, index: number): string {
  const priority = index === 0 ? "Immediate" : index === 1 ? "High" : "Near-term";
  return `<li class="risk-item">
    <span class="risk-number">${index + 1}</span>
    <div>
      <strong>${escapeHtml(stripDomainCode(risk.label))}</strong>
      <p>${escapeHtml(risk.description)}</p>
    </div>
    <span class="priority">${priority}</span>
  </li>`;
}

function renderRoadmap(group: RecommendedActionGroup): string {
  return `<article class="roadmap-card">
    <h3>${escapeHtml(group.label)}</h3>
    <ul>${group.actions.map((action) => `<li>${escapeHtml(action)}</li>`).join("")}</ul>
  </article>`;
}

export function executiveAssessmentSummaryHtml(result: AssessmentResult): string {
  const companyName = "Assessment Client";
  const version = "AGAF Assessment MVP v0.3";
  const topRisks = result.priorityRisks.slice(0, 3);

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AGAF Executive Assessment Summary</title>
  <style>
    :root { color-scheme: dark; --bg: #07111f; --card: #0f1c2e; --panel: #0b1728; --border: #223555; --text: #eaf2ff; --muted: #b8c7dc; --accent: #66d9ef; --good: #8fffcc; --warn: #ffbd59; --risk: #ff6b6b; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: radial-gradient(circle at top left, #164a7d 0, var(--bg) 34rem); color: var(--text); }
    main { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 24px 0; }
    .page { min-height: calc(100vh - 48px); display: grid; grid-template-rows: auto 1fr auto; gap: 14px; border: 1px solid var(--border); border-radius: 30px; background: rgba(15, 28, 46, .94); box-shadow: 0 26px 70px rgba(0,0,0,.34); padding: clamp(22px, 3vw, 34px); }
    header, .topline, .score-row, .lower-grid, footer { display: grid; gap: 14px; }
    header { grid-template-columns: 1.6fr 1fr; align-items: start; padding-bottom: 12px; border-bottom: 1px solid rgba(184,199,220,.16); }
    .eyebrow { color: var(--accent); font-weight: 950; letter-spacing: .14em; text-transform: uppercase; font-size: .78rem; }
    h1 { margin: 8px 0 0; font-size: clamp(2rem, 4.5vw, 4.1rem); line-height: .95; letter-spacing: -.045em; }
    .meta { justify-self: end; width: min(360px, 100%); display: grid; gap: 8px; }
    .meta div { display: flex; justify-content: space-between; gap: 16px; padding: 9px 0; border-bottom: 1px solid rgba(184,199,220,.14); color: var(--muted); font-weight: 750; }
    .meta strong { color: var(--text); text-align: right; }
    .score-row { grid-template-columns: .82fr 1.18fr; align-items: stretch; }
    .score-card, .summary-card, .panel { border: 1px solid var(--border); border-radius: 24px; background: var(--panel); padding: 22px; }
    .score-card { background: linear-gradient(145deg, rgba(102,217,239,.18), rgba(11,23,40,.94)); }
    .score-label { color: var(--accent); font-weight: 950; letter-spacing: .12em; text-transform: uppercase; }
    .score { margin: 12px 0 8px; font-size: clamp(4rem, 10vw, 7rem); line-height: .82; font-weight: 950; letter-spacing: -.07em; }
    .score small { color: var(--muted); font-size: .34em; }
    .risk-badge { display: inline-flex; margin-top: 8px; padding: 10px 14px; border-radius: 999px; background: rgba(255,107,107,.16); color: var(--risk); border: 1px solid rgba(255,107,107,.48); font-weight: 950; }
    h2, h3, p { margin: 0; }
    .summary-card h2, .panel h2 { margin-bottom: 10px; font-size: 1rem; color: var(--accent); letter-spacing: .12em; text-transform: uppercase; }
    .summary-card p { color: var(--text); font-size: clamp(1.05rem, 1.9vw, 1.35rem); line-height: 1.62; font-weight: 650; }
    .lower-grid { grid-template-columns: 1fr 1.15fr; }
    .risk-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
    .risk-item { display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: center; padding: 13px; border: 1px solid rgba(184,199,220,.14); border-radius: 18px; background: rgba(255,255,255,.025); }
    .risk-number { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 999px; background: rgba(102,217,239,.16); color: var(--accent); font-weight: 950; }
    .risk-item strong { font-size: 1rem; }
    .risk-item p { margin-top: 3px; color: var(--muted); line-height: 1.45; font-size: .92rem; }
    .priority { color: var(--warn); font-weight: 950; white-space: nowrap; }
    .roadmap { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
    .roadmap-card { min-height: 150px; border: 1px solid rgba(184,199,220,.14); border-radius: 18px; padding: 16px; background: rgba(102,217,239,.06); }
    .roadmap-card h3 { color: var(--good); margin-bottom: 12px; }
    ul { margin: 0; padding-left: 19px; }
    li { color: var(--muted); line-height: 1.48; margin-bottom: 8px; }
    .message { margin-top: 14px; border: 1px solid rgba(143,255,204,.26); border-radius: 20px; padding: 18px; background: rgba(143,255,204,.08); color: var(--text); font-size: clamp(1.25rem, 2.6vw, 2rem); line-height: 1.35; font-weight: 900; text-align: center; }
    footer { grid-template-columns: 1fr auto; align-items: end; padding-top: 10px; border-top: 1px solid rgba(184,199,220,.16); color: var(--muted); font-weight: 750; }
    footer strong { display: block; color: var(--text); margin-top: 2px; }
    .actions { display: flex; gap: 10px; }
    .link { color: var(--text); text-decoration: none; border: 1px solid var(--border); border-radius: 14px; padding: 10px 14px; font-weight: 900; }
    @media (max-width: 940px) { .page { min-height: auto; } header, .score-row, .lower-grid, .roadmap, footer { grid-template-columns: 1fr; } .meta { justify-self: stretch; } .actions { flex-wrap: wrap; } }
  </style>
</head>
<body>
  <main>
    <section class="page" aria-labelledby="report-title">
      <header>
        <div>
          <div class="eyebrow">Executive Assessment Summary</div>
          <h1 id="report-title">AGAF Executive Assessment Summary</h1>
        </div>
        <div class="meta" aria-label="Assessment metadata">
          <div><span>Company Name</span><strong>${escapeHtml(companyName)}</strong></div>
          <div><span>Assessment Date</span><strong>${escapeHtml(assessmentDate())}</strong></div>
          <div><span>Assessment Version</span><strong>${escapeHtml(version)}</strong></div>
        </div>
      </header>

      <div>
        <section class="score-row" aria-label="Executive score and summary">
          <article class="score-card">
            <div class="score-label">AI Governance Score</div>
            <div class="score">${result.totalScore}<small> / ${result.maxScore}</small></div>
            <div class="risk-badge">${escapeHtml(result.riskLevel)}</div>
          </article>
          <article class="summary-card">
            <h2>Executive Summary</h2>
            <p>${escapeHtml(executiveSummaryFor(result))}</p>
          </article>
        </section>

        <section class="lower-grid" aria-label="Top risks and roadmap">
          <article class="panel">
            <h2>Top 3 Risks</h2>
            <ol class="risk-list">${topRisks.map(renderRisk).join("")}</ol>
          </article>
          <article class="panel">
            <h2>Recommended Roadmap</h2>
            <div class="roadmap">${result.recommendedActions.map(renderRoadmap).join("")}</div>
          </article>
        </section>

        <div class="message">AI 시대의 경쟁력은<br />AI를 사용하는 능력이 아니라<br />AI를 책임 있게 관리하는 능력입니다.</div>
      </div>

      <footer>
        <div>Assessment generated using <strong>AGAF (AI Governance Assessment Framework)</strong>© OpenEntry</div>
        <nav class="actions" aria-label="Report actions">
          <a class="link" href="/assessment/start">Run Again</a>
          <a class="link" href="/demo/assessment">Assessment Home</a>
        </nav>
      </footer>
    </section>
  </main>
</body>
</html>`;
}
