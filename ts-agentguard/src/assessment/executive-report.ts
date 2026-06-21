import { AssessmentResult, PriorityRisk, RecommendedActionGroup, StandardsAlignment, StandardsAlignmentStatus } from "./types";

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function assessmentDate(): string {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(new Date());
}

function renderSummaryText(summary: string): string {
  return summary.split("\n\n").map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
}

function renderRisk(risk: PriorityRisk, index: number): string {
  return `<li>
    <div class="item-index">${index + 1}</div>
    <div><strong>${escapeHtml(risk.label)}</strong><span>${risk.score}%</span><p>${escapeHtml(risk.description)}</p></div>
  </li>`;
}

function renderTopRisks(risks: PriorityRisk[]): string {
  if (risks.length === 0) {
    return `<p class="empty-state">중대한 우선 관리 위험이 확인되지 않았습니다.</p>`;
  }

  return `<ol class="risk-list">${risks.slice(0, 3).map(renderRisk).join("")}</ol>`;
}

function renderRoadmap(group: RecommendedActionGroup): string {
  return `<article class="roadmap-card">
    <h3>${escapeHtml(group.label)}</h3>
    <ul>${group.actions.map((action) => `<li>${escapeHtml(action)}</li>`).join("")}</ul>
  </article>`;
}

function renderAlignmentStatus(status: StandardsAlignmentStatus): string {
  if (status === "GREEN") return "Green";
  if (status === "YELLOW") return "Yellow";
  return "Red";
}

function renderStandardsAlignment(item: StandardsAlignment): string {
  return `<article class="standard-card status-${item.status.toLowerCase()}">
    <div><h3>${escapeHtml(item.label)}</h3><p>${escapeHtml(item.summary)}</p></div>
    <div class="standard-score"><strong>${item.score}</strong><span>${escapeHtml(renderAlignmentStatus(item.status))}</span></div>
  </article>`;
}

export function executiveAssessmentSummaryHtml(result: AssessmentResult): string {
  const companyName = "평가 대상 조직";
  const version = "AGAF Assessment MVP v0.3";

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AGAF Executive Assessment Report</title>
  <style>
    :root { color-scheme: light; --bg: #eef1f5; --paper: #ffffff; --ink: #172033; --muted: #5d687a; --line: #d7dde7; --navy: #12213a; --blue: #1f4e79; --gold: #a67c00; --red: #9f2f2f; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; font-family: Georgia, "Times New Roman", serif; background: var(--bg); color: var(--ink); }
    .toolbar { position: sticky; top: 0; z-index: 2; display: flex; justify-content: flex-end; gap: 10px; padding: 14px 22px; background: rgba(238,241,245,.96); border-bottom: 1px solid var(--line); }
    .toolbar a, .toolbar button { border: 1px solid var(--navy); border-radius: 4px; background: var(--navy); color: white; padding: 10px 14px; font: 700 .9rem Arial, sans-serif; text-decoration: none; cursor: pointer; }
    .toolbar a { background: white; color: var(--navy); }
    main { width: min(960px, calc(100% - 32px)); margin: 28px auto 42px; }
    .report { background: var(--paper); border: 1px solid var(--line); box-shadow: 0 18px 45px rgba(18,33,58,.13); padding: clamp(30px, 5vw, 58px); }
    header { display: grid; grid-template-columns: 1fr auto; gap: 24px; padding-bottom: 24px; border-bottom: 3px solid var(--navy); }
    .eyebrow { color: var(--blue); font: 800 .78rem Arial, sans-serif; letter-spacing: .16em; text-transform: uppercase; }
    h1 { margin: 10px 0 0; color: var(--navy); font-size: clamp(2rem, 4.4vw, 3.7rem); line-height: 1.02; letter-spacing: -.03em; }
    .meta { min-width: 270px; border: 1px solid var(--line); }
    .meta div { display: flex; justify-content: space-between; gap: 16px; padding: 11px 13px; border-bottom: 1px solid var(--line); font: 700 .88rem Arial, sans-serif; }
    .meta div:last-child { border-bottom: 0; }
    .meta span { color: var(--muted); }
    section { padding: 26px 0; border-bottom: 1px solid var(--line); break-inside: avoid; }
    h2 { margin: 0 0 18px; color: var(--navy); font: 800 1rem Arial, sans-serif; letter-spacing: .13em; text-transform: uppercase; }
    h3, p { margin: 0; }
    p, li { color: var(--muted); line-height: 1.68; }
    .score-grid { display: grid; grid-template-columns: .85fr 1.15fr; gap: 20px; }
    .score-box { border: 2px solid var(--navy); padding: 24px; text-align: center; }
    .score-label { color: var(--blue); font: 800 .82rem Arial, sans-serif; letter-spacing: .12em; text-transform: uppercase; }
    .score { margin-top: 10px; color: var(--navy); font: 900 clamp(4rem, 10vw, 6.8rem) Arial, sans-serif; line-height: .9; }
    .score small { color: var(--muted); font-size: .3em; }
    .risk-badge { display: inline-flex; margin-top: 16px; border: 1px solid var(--red); color: var(--red); padding: 8px 12px; font: 900 .94rem Arial, sans-serif; }
    .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .metric { border-left: 4px solid var(--blue); background: #f7f9fc; padding: 14px; }
    .metric span { display: block; color: var(--muted); font: 800 .76rem Arial, sans-serif; text-transform: uppercase; }
    .metric strong { display: block; margin-top: 8px; color: var(--navy); font: 900 1.7rem Arial, sans-serif; }
    .narrative p + p { margin-top: 12px; }
    .risk-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }
    .risk-list li { display: grid; grid-template-columns: auto 1fr; gap: 14px; padding: 15px; border: 1px solid var(--line); background: #fbfcfe; }
    .item-index { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 999px; background: var(--navy); color: white; font: 900 1rem Arial, sans-serif; }
    .risk-list strong { color: var(--navy); font: 900 1rem Arial, sans-serif; }
    .risk-list span { display: block; margin: 4px 0; color: var(--gold); font: 900 .88rem Arial, sans-serif; }
    .roadmap { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .roadmap-card, .standard-card, .recommendation, .empty-state { border: 1px solid var(--line); background: #fbfcfe; padding: 16px; }
    .roadmap-card h3 { color: var(--blue); font: 900 1.1rem Arial, sans-serif; margin-bottom: 10px; }
    ul { margin: 0; padding-left: 20px; }
    .standards-grid { display: grid; gap: 12px; }
    .standard-card { display: grid; grid-template-columns: 1fr auto; gap: 18px; align-items: start; }
    .standard-card h3 { color: var(--navy); font: 900 1rem Arial, sans-serif; margin-bottom: 6px; }
    .standard-score { min-width: 76px; text-align: right; font-family: Arial, sans-serif; }
    .standard-score strong { display: block; color: var(--navy); font-size: 2rem; line-height: 1; }
    .standard-score span { color: var(--gold); font-weight: 900; text-transform: uppercase; }
    .recommendation { border-left: 5px solid var(--navy); }
    footer { padding-top: 22px; color: var(--muted); font: 700 .9rem Arial, sans-serif; display: flex; justify-content: space-between; gap: 18px; }
    footer strong { color: var(--navy); }
    @media (max-width: 820px) { header, .score-grid, .metric-grid, .roadmap, .standard-card, footer { grid-template-columns: 1fr; } .meta { min-width: 0; } }
    @media print { body { background: white; } .toolbar { display: none; } main { width: 100%; margin: 0; } .report { border: 0; box-shadow: none; padding: 0; } section { break-inside: avoid; } }
  </style>
</head>
<body>
  <nav class="toolbar" aria-label="Report actions">
    <a href="/assessment/start">다시 평가하기</a>
    <button type="button" onclick="window.print()">Print Report</button>
  </nav>
  <main>
    <article class="report" aria-labelledby="report-title">
      <header>
        <div>
          <div class="eyebrow">Executive Summary</div>
          <h1 id="report-title">AGAF Executive Assessment Report</h1>
        </div>
        <div class="meta" aria-label="Assessment metadata">
          <div><span>회사명</span><strong>${escapeHtml(companyName)}</strong></div>
          <div><span>평가일</span><strong>${escapeHtml(assessmentDate())}</strong></div>
          <div><span>버전</span><strong>${escapeHtml(version)}</strong></div>
        </div>
      </header>

      <section aria-labelledby="score-title">
        <h2 id="score-title">Section 1 · AI Governance Score</h2>
        <div class="score-grid">
          <div class="score-box"><div class="score-label">총점</div><div class="score">${result.totalScore}<small> / ${result.maxScore}</small></div><div class="risk-badge">${escapeHtml(result.riskLevel)}</div></div>
          <div class="metric-grid">
            <div class="metric"><span>규제 대응 준비도</span><strong>${escapeHtml(result.regulatoryReadiness)}</strong></div>
            <div class="metric"><span>통제 성숙도</span><strong>${escapeHtml(result.controlMaturity)}</strong></div>
            <div class="metric"><span>감사 대응 준비도</span><strong>${escapeHtml(result.auditReadiness)}</strong></div>
          </div>
        </div>
      </section>

      <section class="narrative" aria-labelledby="narrative-title"><h2 id="narrative-title">Section 2 · 경영진 요약</h2>${renderSummaryText(result.executiveSummary)}</section>
      <section aria-labelledby="risks-title"><h2 id="risks-title">Section 3 · Top 3 Risks</h2>${renderTopRisks(result.priorityRisks)}</section>
      <section aria-labelledby="roadmap-title"><h2 id="roadmap-title">Section 4 · 30 / 90 / 180 실행계획</h2><div class="roadmap">${result.recommendedActions.map(renderRoadmap).join("")}</div></section>
      <section aria-labelledby="standards-title"><h2 id="standards-title">Section 5 · 표준 연계 결과</h2><div class="standards-grid">${result.standardsAlignment.map(renderStandardsAlignment).join("")}</div></section>
      <section aria-labelledby="recommendation-title"><h2 id="recommendation-title">Section 6 · 경영진 권고사항</h2><div class="recommendation"><p>AI 활용 확대 이전에 승인·감사·위험관리 체계를 우선 정비할 것을 권고합니다.</p><p>특히 고위험 AI 사용 시 Human Review 체계 구축이 필요합니다.</p></div></section>

      <footer>
        <div>Assessment generated using <strong>AGAF</strong><br />(AI Governance Assessment Framework)</div>
        <div>© OpenEntry</div>
      </footer>
    </article>
  </main>
</body>
</html>`;
}
