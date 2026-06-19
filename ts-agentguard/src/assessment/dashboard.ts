import { businessImpactForExecutiveSummary, executiveSummaryText } from "./executive-summary";
import { generateRecommendations, quickWinsFor, roadmapFor, topWeaknesses } from "./recommendation-engine";
import type { IndustryType } from "./industry-profiles";
import { AssessmentResult, DomainScore } from "./types";

type IndustryAwareAssessmentResult = AssessmentResult & {
  industry: IndustryType;
  industryLabel: string;
  weightedScore: number;
  industryRisk: string;
  primaryRiskFocus: string;
  industryRecommendations: string[];
  industryCoreControlAreas: string[];
  industryPhases: Array<{ phase: string; title: string }>;
};

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

function lowestDomainScores(result: AssessmentResult): DomainScore[] {
  return topWeaknesses(result);
}

export function topRisksForDashboard(result: AssessmentResult): string[] {
  if (result.totalScore >= 90) return ["No Critical Risks Identified"];
  return lowestDomainScores(result).map((domainScore) => riskMessages[domainScore.domain]);
}

export function recommendationsForDashboard(result: IndustryAwareAssessmentResult): string[] {
  return generateRecommendations(result).map((recommendation) => `${recommendation.title}: ${recommendation.expectedOutcome}`);
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

function renderBulletList(items: string[]): string {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderExecutiveSummary(result: IndustryAwareAssessmentResult): string {
  const priorityAreas = topWeaknesses(result);
  return `<section class="executive" aria-labelledby="executive-title">
    <div class="section-kicker">Executive Summary</div>
    <h2 id="executive-title">경영진 보고서</h2>
    <p>현재 수준: <strong>${escapeHtml(result.maturityLevel.displayName)}</strong></p>
    <p>귀사는 <strong>${escapeHtml(result.industryLabel)}</strong> 기준으로 평가되었습니다.</p>
    <p>${escapeHtml(result.industryLabel)} 산업에서는 <strong>${escapeHtml(result.industryCoreControlAreas.join("와 "))}</strong>이 핵심 통제 영역입니다.</p>
    <p>총점은 <strong>${result.totalScore}/${result.maxScore}</strong>, 산업 가중 점수는 <strong>${result.weightedScore}/${result.maxScore}</strong>으로 현재 AI 사용은 이루어지고 있으나 통제 체계는 개선이 필요한 상태입니다.</p>
    <p>가장 취약한 영역은 다음 3개 영역입니다.</p>
    ${renderNumberedList(priorityAreas.map((area) => area.label))}
    <p>예상 우선 개선 기간: <strong>30~90일</strong></p>
    <details><summary>보고서 원문 보기</summary><pre>${escapeHtml(executiveSummaryText(result))}</pre></details>
  </section>`;
}

function renderBusinessImpact(result: AssessmentResult): string {
  return `<section class="impact" aria-labelledby="impact-title">
    <div class="section-kicker">Business Impact</div>
    <h2 id="impact-title">현재 상태 유지 시 위험</h2>
    <p>현재 상태를 유지할 경우 다음 위험이 존재합니다.</p>
    ${renderBulletList(businessImpactForExecutiveSummary(result))}
  </section>`;
}

function renderIndustryProfile(result: IndustryAwareAssessmentResult): string {
  return `<section class="industry-profile" aria-labelledby="industry-profile-title">
    <div class="section-kicker">Industry Profile</div>
    <h2 id="industry-profile-title">${escapeHtml(result.industryLabel)}</h2>
    <div class="industry-grid">
      <article><span>Primary Risk Focus</span><strong>${escapeHtml(result.primaryRiskFocus)}</strong></article>
      <article><span>Weighted Score</span><strong>${result.weightedScore} / ${result.maxScore}</strong></article>
      <article><span>Industry Risk</span><strong>${escapeHtml(result.industryRisk)}</strong></article>
    </div>
  </section>`;
}

function renderRecommendationEngine(result: IndustryAwareAssessmentResult): string {
  const recommendations = generateRecommendations(result);
  return `<section class="industry-recommendation" aria-labelledby="industry-recommendation-title">
    <div class="section-kicker">Recommendation Engine</div>
    <h2 id="industry-recommendation-title">우선순위 실행계획</h2>
    <div class="recommendation-list">${recommendations.map((item) => `<article class="recommendation-card"><span>Priority ${item.priority}</span><strong>${escapeHtml(item.title)}</strong><p><b>Reason:</b> ${escapeHtml(item.reason)}</p><p><b>Expected Outcome:</b> ${escapeHtml(item.expectedOutcome)}</p></article>`).join("")}</div>
  </section>`;
}

function renderQuickWins(result: IndustryAwareAssessmentResult): string {
  return `<section class="quick-wins" aria-labelledby="quick-wins-title"><div class="section-kicker">Quick Wins</div><h2 id="quick-wins-title">30일 이내 저비용 실행 항목</h2><ul>${quickWinsFor(result).map((item) => `<li>✓ ${escapeHtml(item)}</li>`).join("")}</ul></section>`;
}

function renderRoadmap(result: IndustryAwareAssessmentResult): string {
  return `<section class="recommendation" aria-labelledby="roadmap-title">
    <div class="section-kicker">90-Day Roadmap</div>
    <h2 id="roadmap-title">산업군과 취약영역 기반 실행 순서</h2>
    <div class="phase-grid">${roadmapFor(result).map((item) => `<article class="phase"><span>${escapeHtml(item.day)}</span><strong>${escapeHtml(item.title)}</strong></article>`).join("")}</div>
  </section>`;
}

export function assessmentDashboardHtml(result: IndustryAwareAssessmentResult): string {
  const topRisks = topRisksForDashboard(result);
  const recommendations = recommendationsForDashboard(result);

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AI Governance Readiness Dashboard</title>
  <style>
    :root { color-scheme: dark; --bg: #07111f; --card: #0f1c2e; --panel: #0b1728; --border: #223555; --text: #eaf2ff; --muted: #b8c7dc; --accent: #66d9ef; --accent2: #8fffcc; --risk: #ff6b6b; --warn: #ffbd59; }
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
    .summary-cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
    .industry-profile { grid-column: 1 / -1; }
    .industry-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .industry-grid article { padding: 18px; border: 1px solid var(--border); border-radius: 18px; background: var(--panel); }
    .industry-grid span { display: block; margin-bottom: 10px; color: var(--muted); font-weight: 900; text-transform: uppercase; letter-spacing: .1em; }
    .industry-grid strong { color: var(--accent2); font-size: 1.35rem; }
    .summary-card { min-height: 132px; padding: 22px; border: 1px solid var(--border); border-radius: 22px; background: linear-gradient(145deg, rgba(102,217,239,.12), rgba(11,23,40,.88)); }
    .summary-card p { margin: 0 0 18px; font-size: .86rem; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; }
    .summary-card strong { display: block; font-size: clamp(1.7rem, 4vw, 3rem); line-height: 1; }
    .grade-card { border-color: var(--warn); background: linear-gradient(145deg, rgba(255,189,89,.18), rgba(11,23,40,.9)); }
    .section-kicker { margin-bottom: 10px; color: var(--accent); font-weight: 900; letter-spacing: .14em; text-transform: uppercase; }
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
    .executive, .impact, .recommendation, .industry-recommendation, .quick-wins, .framework { grid-column: 1 / -1; }
    .executive strong { color: var(--accent2); }
    details { margin-top: 18px; color: var(--muted); }
    summary { cursor: pointer; font-weight: 900; color: var(--accent); }
    pre { white-space: pre-wrap; border: 1px solid var(--border); border-radius: 18px; padding: 18px; background: var(--panel); color: var(--text); line-height: 1.7; }
    ul { margin: 0; padding-left: 24px; }
    .phase-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
    .phase { padding: 18px; border: 1px solid var(--border); border-radius: 18px; background: var(--panel); }
    .phase span { display: block; margin-bottom: 10px; color: var(--accent); font-weight: 900; }
    .phase strong { font-size: 1.05rem; }
    .recommendation-list { display: grid; gap: 14px; }
    .recommendation-card { padding: 18px; border: 1px solid var(--border); border-radius: 18px; background: var(--panel); }
    .recommendation-card span { display: block; margin-bottom: 8px; color: var(--accent); font-weight: 900; }
    .recommendation-card strong { display: block; margin-bottom: 10px; color: var(--accent2); font-size: 1.15rem; }
    .framework { text-align: center; }
    .flow { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 12px; margin: 20px 0; }
    .step { padding: 13px 18px; border: 1px solid var(--border); border-radius: 999px; background: var(--panel); font-weight: 900; }
    .current { border-color: var(--accent); box-shadow: 0 0 0 4px rgba(102,217,239,.12); }
    .arrow { color: var(--accent); font-size: 1.45rem; }
    .stage { margin: 0; color: var(--accent2); font-weight: 900; }
    .back { color: var(--text); text-decoration: none; border: 1px solid var(--border); border-radius: 14px; padding: 12px 16px; font-weight: 900; }
    @media (max-width: 860px) { .summary-cards, .dashboard-grid, .phase-grid, .industry-grid { grid-template-columns: 1fr; } .domains, .insights, .summary, .executive, .impact, .recommendation, .framework { grid-column: 1; } .flow { flex-direction: column; } .arrow { transform: rotate(90deg); } }
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
          <article class="summary-card grade-card"><p>Governance Grade</p><strong>${escapeHtml(result.governanceGrade)}</strong></article>
          ${renderSummaryCard("AI Readiness", result.aiReadiness)}
          ${renderSummaryCard("Total Score", `${result.totalScore} / ${result.maxScore}`)}
          ${renderSummaryCard("Risk Level", result.riskLevel)}
          ${renderSummaryCard("Maturity", result.maturityLevel.displayName)}
        </div>
      </section>
      ${renderIndustryProfile(result)}
      <section class="domains" aria-labelledby="domain-title">
        <h2 id="domain-title">Domain Scores</h2>
        ${result.domainScores.map(renderDomainScore).join("")}
      </section>
      <div class="insights">
        <section aria-labelledby="risks-title"><h2 id="risks-title">Top Risks</h2>${renderNumberedList(topRisks)}</section>
        <section aria-labelledby="recommendations-title"><h2 id="recommendations-title">Recommendations</h2>${renderNumberedList(recommendations)}</section>
      </div>
      ${renderExecutiveSummary(result)}
      ${renderBusinessImpact(result)}
      ${renderRecommendationEngine(result)}
      ${renderQuickWins(result)}
      ${renderRoadmap(result)}
      <section class="framework" aria-labelledby="framework-title">
        <h2 id="framework-title">OpenEntry Framework</h2>
        <div class="flow"><span class="step">Landing</span><span class="arrow">↓</span><span class="step">Industry Selection</span><span class="arrow">↓</span><span class="step">Questionnaire</span><span class="arrow">↓</span><span class="step">Scoring</span><span class="arrow">↓</span><span class="step current">Dashboard</span><span class="arrow">↓</span><span class="step">Weakness Analysis</span><span class="arrow">↓</span><span class="step">Recommendations</span><span class="arrow">↓</span><span class="step">Quick Wins</span><span class="arrow">↓</span><span class="step">90-Day Roadmap</span></div>
        <p class="stage">Current Stage: Assessment</p>
      </section>
    </div>
  </main>
</body>
</html>`;
}
