import { assessmentQuestions } from "./questions";
import { recommendationsFor, topRisksFor } from "./recommendations";
import { demoAssessmentAnswers, evaluateAssessment } from "./scoring";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function assessmentHtml(): string {
  const result = evaluateAssessment(demoAssessmentAnswers);
  const topRisks = topRisksFor(result);
  const recommendations = recommendationsFor(result);

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OpenEntry AI Risk Assessment</title>
  <style>
    :root { color-scheme: dark; --bg: #07111f; --panel: #101c2d; --line: #26364d; --text: #eef5ff; --muted: #a9bad3; --accent: #62d5ff; --warn: #ffbd59; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: radial-gradient(circle at top left, #15375c 0, var(--bg) 36rem); color: var(--text); }
    main { max-width: 1180px; margin: 0 auto; padding: 44px 22px 56px; }
    .hero { display: grid; gap: 18px; margin-bottom: 28px; }
    .eyebrow { color: var(--accent); font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
    h1 { margin: 0; font-size: clamp(2rem, 5vw, 4.5rem); line-height: .95; }
    h2 { margin: 0 0 14px; font-size: 1.25rem; }
    p { color: var(--muted); line-height: 1.65; margin: 0; }
    .grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 18px; }
    .card { grid-column: span 4; background: rgba(16, 28, 45, .88); border: 1px solid var(--line); border-radius: 22px; padding: 22px; box-shadow: 0 20px 55px rgba(0,0,0,.22); }
    .wide { grid-column: span 8; } .full { grid-column: 1 / -1; }
    .metric { font-size: 2.5rem; font-weight: 800; margin-top: 10px; }
    .label { color: var(--muted); font-size: .95rem; }
    .badge { display: inline-flex; padding: 8px 12px; border-radius: 999px; background: rgba(255,189,89,.16); color: var(--warn); font-weight: 700; }
    .domains { display: grid; gap: 12px; }
    .domain-row { display: grid; grid-template-columns: 180px 1fr 70px; gap: 14px; align-items: center; }
    .bar { height: 12px; overflow: hidden; border-radius: 999px; background: #24344b; }
    .bar > span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #62d5ff, #8fffcc); }
    ol, ul { margin: 0; padding-left: 22px; color: var(--muted); line-height: 1.8; }
    .questions { columns: 2; column-gap: 34px; }
    .question { break-inside: avoid; margin: 0 0 10px; color: var(--muted); }
    .funnel { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
    .step { padding: 12px 16px; border-radius: 16px; border: 1px solid var(--line); background: #0c1727; font-weight: 700; }
    .arrow { color: var(--accent); font-size: 1.4rem; }
    @media (max-width: 860px) { .card, .wide { grid-column: 1 / -1; } .domain-row { grid-template-columns: 1fr; } .questions { columns: 1; } }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <div class="eyebrow">OpenEntry AI Risk Assessment</div>
      <h1>AI Governance Readiness Dashboard</h1>
      <p>Most companies are adopting AI faster than they can govern it. OpenEntry helps organizations assess AI risk, design governance controls, and prepare runtime enforcement through AgentGuard.</p>
      <p>기업은 AI를 도입하는 속도보다 AI를 통제하는 속도가 느립니다. OpenEntry는 AI 리스크를 진단하고, 거버넌스 통제 체계를 설계하며, 향후 AgentGuard를 통해 실행 단계 통제까지 연결합니다.</p>
    </section>

    <section class="grid">
      <article class="card"><div class="label">Total Score</div><div class="metric">${result.totalScore} / ${result.maxScore}</div></article>
      <article class="card"><div class="label">Risk Level</div><div class="metric"><span class="badge">${escapeHtml(result.riskLevel)}</span></div></article>
      <article class="card"><div class="label">Maturity Level</div><div class="metric">${escapeHtml(result.maturityLevel.displayName)}</div></article>

      <article class="card wide">
        <h2>Domain Scores</h2>
        <div class="domains">
          ${result.domainScores.map((score) => `<div class="domain-row"><strong>${escapeHtml(score.label)}</strong><div class="bar" aria-label="${escapeHtml(score.label)} ${score.score} of ${score.maxScore}"><span style="width: ${(score.score / score.maxScore) * 100}%"></span></div><span>${score.score}/${score.maxScore}</span></div>`).join("")}
        </div>
      </article>

      <article class="card">
        <h2>Top Risks</h2>
        <ol>${topRisks.map((risk) => `<li>${escapeHtml(risk)}</li>`).join("")}</ol>
      </article>

      <article class="card full">
        <h2>Recommendations</h2>
        <ol>${recommendations.map((recommendation) => `<li>${escapeHtml(recommendation)}</li>`).join("")}</ol>
      </article>

      <article class="card full">
        <h2>Assessment Questionnaire</h2>
        <div class="questions">${assessmentQuestions.map((question) => `<p class="question"><strong>${escapeHtml(question.domain)}:</strong> ${escapeHtml(question.title)}</p>`).join("")}</div>
      </article>

      <article class="card full">
        <h2>OpenEntry Governance Funnel</h2>
        <div class="funnel"><span class="step">Assessment</span><span class="arrow">→</span><span class="step">Governance Design</span><span class="arrow">→</span><span class="step">Policy Library</span><span class="arrow">→</span><span class="step">AgentGuard Runtime Control</span></div>
      </article>
    </section>
  </main>
</body>
</html>`;
}
