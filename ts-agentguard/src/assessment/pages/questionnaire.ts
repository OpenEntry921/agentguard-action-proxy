import { assessmentQuestions } from "../questions";
import { AssessmentQuestion } from "../types";

const domainLabels: Record<AssessmentQuestion["domain"], string> = {
  AI_USAGE: "AI Usage",
  DATA_PROTECTION: "Data Protection",
  ACCESS_CONTROL: "Access Control",
  AUDIT_TRACEABILITY: "Audit & Traceability",
  AGENT_RISK: "Agent Risk",
};

const answerOptions = [
  { value: 0, label: "없음" },
  { value: 1, label: "일부 존재" },
  { value: 2, label: "보통" },
  { value: 3, label: "잘 관리" },
  { value: 5, label: "완전 구현" },
];

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderQuestion(question: AssessmentQuestion, index: number): string {
  return `<fieldset class="question-card">
    <legend><span class="domain">[${escapeHtml(domainLabels[question.domain])}]</span><span class="question-number">Question ${index + 1}</span></legend>
    <p class="question-title">${escapeHtml(question.title)}</p>
    <div class="answers" role="radiogroup" aria-label="${escapeHtml(question.title)}">
      ${answerOptions
        .map(
          (option) => `<label class="answer-option">
        <input type="radio" name="${escapeHtml(question.id)}" value="${option.value}" />
        <span>${option.value}</span>
        <span>${escapeHtml(option.label)}</span>
      </label>`,
        )
        .join("")}
    </div>
  </fieldset>`;
}

export function assessmentQuestionnaireHtml(): string {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OpenEntry AI Governance Assessment Framework v1</title>
  <style>
    :root { color-scheme: dark; --bg: #07111f; --card: #0f1c2e; --panel: #0b1728; --border: #223555; --text: #eaf2ff; --muted: #b8c7dc; --accent: #66d9ef; --button: #2f80ed; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: radial-gradient(circle at top left, #12345a 0, var(--bg) 34rem); color: var(--text); }
    main { width: min(980px, calc(100% - 40px)); margin: 0 auto; padding: 72px 0; }
    .card { border: 1px solid var(--border); border-radius: 28px; background: rgba(15, 28, 46, .92); box-shadow: 0 26px 70px rgba(0, 0, 0, .32); padding: clamp(28px, 5vw, 52px); }
    h1 { font-size: clamp(2rem, 6vw, 4rem); line-height: 1; margin: 0 0 18px; }
    p { color: var(--muted); font-size: 1.08rem; line-height: 1.7; }
    .intro { margin-bottom: 34px; }
    .questions { display: grid; gap: 18px; }
    .question-card { margin: 0; padding: 22px; border: 1px solid var(--border); border-radius: 20px; background: rgba(11, 23, 40, .72); }
    legend { display: flex; flex-wrap: wrap; gap: 10px 14px; align-items: center; padding: 0 8px; font-weight: 800; }
    .domain { color: var(--accent); }
    .question-number { color: var(--muted); font-size: .92rem; }
    .question-title { margin: 16px 0 18px; color: var(--text); font-weight: 750; }
    .answers { display: grid; grid-template-columns: repeat(5, minmax(120px, 1fr)); gap: 10px; }
    .answer-option { display: grid; grid-template-columns: auto auto 1fr; gap: 8px; align-items: center; min-height: 48px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 14px; background: var(--panel); color: var(--muted); cursor: pointer; }
    .answer-option:focus-within, .answer-option:hover { border-color: var(--accent); color: var(--text); }
    input { accent-color: var(--accent); }
    .actions { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; justify-content: space-between; margin-top: 30px; }
    button, a { display: inline-flex; align-items: center; min-height: 46px; border-radius: 14px; font-weight: 800; padding: 0 20px; text-decoration: none; }
    button { border: 0; background: var(--button); color: white; cursor: pointer; }
    button:focus, button:hover { background: #1f6fd6; }
    a { border: 1px solid var(--border); color: var(--text); }
    a:focus, a:hover { border-color: var(--accent); }
    @media (max-width: 840px) { .answers { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <section class="card" aria-labelledby="questionnaire-title">
      <h1 id="questionnaire-title">OpenEntry AI Governance Assessment Framework v1</h1>
      <p class="intro">20 Questions → Answer Collection. 이번 Sprint에서는 질문 표시, 답변 선택, 다음 버튼만 제공합니다.</p>
      <form onsubmit="event.preventDefault(); alert('Coming in Sprint 3: Scoring Engine');">
        <div class="questions">${assessmentQuestions.map(renderQuestion).join("")}</div>
        <div class="actions">
          <a href="/demo/assessment">Back to Assessment Dashboard</a>
          <button type="submit">Continue Assessment</button>
        </div>
      </form>
    </section>
  </main>
</body>
</html>`;
}
