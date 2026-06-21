import { AssessmentResult, DomainExplanation, DomainScore, RecommendedActionGroup, PriorityRisk, QuestionExplanation, StandardsAlignment, StandardsAlignmentStatus } from "./types";

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function serializeResultForScript(result: AssessmentResult): string {
  return JSON.stringify(result).replaceAll("<", "\\u003c");
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
    <div class="progress" aria-label="${escapeHtml(domainScore.label)} 점수 ${domainScore.score} / ${domainScore.maxScore}"><span style="width: ${domainScore.score}%"></span></div>
  </div>`;
}

function renderPriorityRisk(risk: PriorityRisk): string {
  return `<li><strong>${escapeHtml(risk.label)}</strong><span>${risk.score}%</span><p>${escapeHtml(risk.description)}</p></li>`;
}

function renderPriorityRisks(risks: PriorityRisk[]): string {
  if (risks.length === 0) {
    return `<p class="empty-state">중대한 우선 관리 위험이 확인되지 않았습니다.</p>`;
  }

  return `<ol>${risks.map(renderPriorityRisk).join("")}</ol>`;
}

function renderActionGroup(group: RecommendedActionGroup): string {
  return `<article>
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
  return `<article class="alignment-card alignment-${item.status.toLowerCase()}">
    <div class="alignment-head">
      <div>
        <h3>${escapeHtml(item.label)}</h3>
        <p>${escapeHtml(item.summary)}</p>
      </div>
      <div class="alignment-score">
        <strong>${item.score}</strong>
        <span>${escapeHtml(renderAlignmentStatus(item.status))}</span>
      </div>
    </div>
    <div class="impact-badge">표준 영향도 ${escapeHtml(item.impact)}</div>
    <div class="standard-list">${item.standards
      .map(
        (standard) => `<details class="standard-card">
          <summary><strong>${escapeHtml(standard.framework)}</strong><span>${escapeHtml(standard.reference)}</span></summary>
          <dl>
            <div><dt>Meaning</dt><dd>${escapeHtml(standard.meaning)}</dd></div>
            <div><dt>Current Implication</dt><dd>${escapeHtml(standard.currentImplication)}</dd></div>
            <div><dt>Recommended Improvement</dt><dd>${escapeHtml(standard.recommendedImprovement)}</dd></div>
          </dl>
        </details>`,
      )
      .join("")}</div>
  </article>`;
}

function renderAnswerLabel(answer: QuestionExplanation["answer"]): string {
  if (answer === "YES") return "예";
  if (answer === "PARTIAL") return "일부";
  if (answer === "NOT SURE") return "확인 필요";
  return "아니오";
}

function renderMaturityLabel(displayName: string): string {
  return displayName
    .replace("Level 1 Initial", "1단계 초기")
    .replace("Level 2 Developing", "2단계 개발 중")
    .replace("Level 3 Managed", "3단계 관리 중")
    .replace("Level 4 Governed", "4단계 거버넌스 운영")
    .replace("Level 5 Optimized", "5단계 최적화");
}

function renderQuestionExplanation(question: QuestionExplanation): string {
  return `<tr>
    <td>${escapeHtml(question.displayId)}</td>
    <td>${escapeHtml(renderAnswerLabel(question.answer))}</td>
    <td>${question.points}/${question.maxPoints}</td>
    <td>${escapeHtml(question.impact)}</td>
  </tr>`;
}

function renderExplanation(explanation: DomainExplanation): string {
  return `<article class="explanation-card">
    <div class="explanation-head">
      <div><h3>${escapeHtml(explanation.label)}</h3><p>${escapeHtml(explanation.narrative)}</p></div>
      <strong>${explanation.score}<small>/100</small></strong>
    </div>
    <table>
      <thead><tr><th>문항</th><th>답변</th><th>점수</th><th>평가 영향</th></tr></thead>
      <tbody>${explanation.answerBreakdown.map(renderQuestionExplanation).join("")}</tbody>
    </table>
    <div class="findings"><span>결과</span><ul>${explanation.findings.map((finding) => `<li>${escapeHtml(finding)}</li>`).join("")}</ul></div>
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
    .header-actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: flex-end; }
    .back, .summary-button { display: inline-flex; align-items: center; color: var(--text); text-decoration: none; border: 1px solid var(--border); border-radius: 14px; padding: 12px 16px; font: inherit; font-weight: 900; background: rgba(102,217,239,.08); cursor: pointer; }
    .summary-button { border-color: rgba(102,217,239,.5); color: var(--accent); }
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
    .domains h2, .risks h2, .actions h2, .standards h2 { margin: 6px 0 18px; font-size: 1.35rem; }
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
    .empty-state { margin: 0; padding: 18px; border: 1px solid rgba(143,255,204,.26); border-radius: 18px; background: rgba(143,255,204,.08); color: var(--text); font-weight: 850; }
    .actions { grid-column: 1 / -1; }
    .action-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .action-grid article { padding: 20px; border: 1px solid var(--border); border-radius: 20px; background: var(--panel); }
    .action-grid h3 { margin-bottom: 16px; color: var(--good); font-size: 1.35rem; }
    .standards { grid-column: 1 / -1; }
    .standards > p { margin-top: -6px; }
    .alignment-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-top: 18px; }
    .alignment-card { padding: 20px; border: 1px solid var(--border); border-radius: 22px; background: var(--panel); }
    .alignment-red { border-color: rgba(255,107,107,.46); }
    .alignment-yellow { border-color: rgba(255,189,89,.46); }
    .alignment-green { border-color: rgba(143,255,204,.36); }
    .alignment-head { display: flex; justify-content: space-between; gap: 18px; align-items: flex-start; }
    .alignment-head h3 { font-size: 1.22rem; }
    .alignment-head p { margin: 8px 0 0; }
    .alignment-score { min-width: 86px; text-align: right; }
    .alignment-score strong { display: block; color: var(--text); font-size: 2.4rem; line-height: 1; }
    .alignment-score span, .impact-badge { display: inline-flex; margin-top: 8px; padding: 7px 10px; border-radius: 999px; color: var(--text); border: 1px solid rgba(184,199,220,.24); background: rgba(184,199,220,.08); font-weight: 900; text-transform: uppercase; letter-spacing: .05em; font-size: .74rem; }
    .impact-badge { color: var(--warn); text-transform: none; letter-spacing: 0; }
    .standard-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; padding: 16px 0 0; }
    .standard-card { border: 1px solid rgba(184,199,220,.14); border-radius: 14px; background: rgba(102,217,239,.06); color: var(--muted); overflow: hidden; }
    .standard-card summary { cursor: pointer; list-style-position: inside; padding: 12px; color: var(--text); }
    .standard-card summary strong { display: block; margin: 0 0 5px 20px; }
    .standard-card summary span { display: block; margin-left: 20px; color: var(--muted); font-size: .9rem; }
    .standard-card dl { display: grid; gap: 10px; margin: 0; padding: 0 12px 14px; }
    .standard-card dl div { padding-top: 10px; border-top: 1px solid rgba(184,199,220,.12); }
    .standard-card dt { color: var(--accent); font-size: .72rem; font-weight: 950; letter-spacing: .08em; text-transform: uppercase; }
    .standard-card dd { margin: 4px 0 0; color: var(--muted); line-height: 1.62; }
    .explainability { grid-column: 1 / -1; }
    .explanation-grid { display: grid; gap: 16px; margin-top: 18px; }
    .explanation-card { padding: 20px; border: 1px solid var(--border); border-radius: 22px; background: var(--panel); }
    .explanation-head { display: flex; justify-content: space-between; gap: 18px; align-items: flex-start; margin-bottom: 16px; }
    .explanation-head strong { color: var(--warn); font-size: 2.3rem; line-height: 1; white-space: nowrap; }
    .explanation-head small { color: var(--muted); font-size: 1rem; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0 16px; overflow: hidden; border-radius: 16px; }
    th, td { padding: 12px; border-bottom: 1px solid rgba(184,199,220,.14); text-align: left; color: var(--muted); }
    th { color: var(--text); background: rgba(102,217,239,.08); font-size: .82rem; text-transform: uppercase; letter-spacing: .08em; }
    td:first-child, td:nth-child(2), td:nth-child(3) { color: var(--text); font-weight: 900; white-space: nowrap; }
    .findings { display: grid; gap: 10px; padding: 16px; border: 1px solid rgba(255,189,89,.36); border-radius: 18px; background: rgba(255,189,89,.08); }
    .findings span { color: var(--warn); font-weight: 950; }
    .findings li { margin-bottom: 6px; }
    @media (max-width: 920px) { .hero, .metrics, .dashboard-grid, .action-grid, .alignment-grid, .standard-list { grid-template-columns: 1fr; } .domains, .risks, .actions, .standards, .hero, .metrics { grid-column: 1; } }
  </style>
</head>
<body>
  <main>
    <header>
      <div><div class="eyebrow">AGAF Assessment MVP v0.3</div><h1>Executive Dashboard</h1><p>현재 5개 Domain과 기존 질문 응답만으로 AI 거버넌스 점수, 위험등급, 규제 준비도, 실행계획을 자동 생성합니다.</p></div>
      <div class="header-actions">
        <a class="back" href="/assessment/start">다시 평가하기</a>
        <button class="summary-button" type="button" id="executive-summary-button">Executive Summary</button>
      </div>
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
        ${renderMetric("규제 대응 준비도", result.regulatoryReadiness, "현재 평가 범위 내에서 산정")}
        ${renderMetric("통제 성숙도", result.controlMaturity, renderMaturityLabel(result.maturityLevel.displayName))}
        ${renderMetric("감사 대응 준비도", result.auditReadiness, `거버넌스 등급 ${result.governanceGrade}`)}
      </section>
      <section class="domains" aria-labelledby="domain-title">
        <div class="section-kicker">5 Domain Overview</div>
        <h2 id="domain-title">영역별 점수 현황</h2>
        ${result.domainScores.map(renderDomainScore).join("")}
      </section>
      <section class="risks" aria-labelledby="risks-title">
        <div class="section-kicker">Highest Priority Risks</div>
        <h2 id="risks-title">우선 관리 위험</h2>
        ${renderPriorityRisks(topRisks)}
      </section>
      <section class="actions" aria-labelledby="actions-title">
        <div class="section-kicker">Recommended Actions</div>
        <h2 id="actions-title">권장 실행 계획</h2>
        <div class="action-grid">${result.recommendedActions.map(renderActionGroup).join("")}</div>
      </section>
      <section class="standards" aria-labelledby="standards-title">
        <div class="section-kicker">Standards Alignment</div>
        <h2 id="standards-title">표준 연계 결과</h2>
        <p>현재 MVP 5개 Domain의 기존 점수를 ISO/IEC 42001, NIST AI RMF, EU AI Act, 금융위 AI 가이드라인 관점의 결과로 요약합니다. 조문 전문과 내부 Crosswalk는 표시하지 않습니다.</p>
        <div class="alignment-grid">${result.standardsAlignment.map(renderStandardsAlignment).join("")}</div>
      </section>
      <section class="explainability" aria-labelledby="explainability-title">
        <div class="section-kicker">Explainability Layer</div>
        <h2 id="explainability-title">왜 이런 점수가 나왔는가?</h2>
        <p>평가 결과는 응답 내용과 영역별 준비 수준을 바탕으로 산정되었습니다. 현재 평가 범위 내에서 양호한 영역과 우선 보완 영역을 함께 확인할 수 있습니다.</p>
        <div class="explanation-grid">${result.explanations.map(renderExplanation).join("")}</div>
      </section>
    </div>
  </main>
<script>
    const dashboardResult = ${serializeResultForScript(result)};
    document.getElementById("executive-summary-button").addEventListener("click", async () => {
      const response = await fetch("/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result: dashboardResult }),
      });
      const html = await response.text();
      document.open();
      document.write(html);
      document.close();
    });
  </script>
</body>
</html>`;
}
