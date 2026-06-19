import { assessmentQuestions } from "../questions";
import { defaultIndustry, industryProfiles, IndustryType } from "../industry-profiles";
import { AssessmentQuestion } from "../types";

const domainLabels: Record<AssessmentQuestion["domain"], string> = {
  AI_USAGE: "AI Usage",
  DATA_PROTECTION: "Data Protection",
  ACCESS_CONTROL: "Access Control",
  AUDIT_TRACEABILITY: "Audit & Traceability",
  AGENT_RISK: "Agent Risk",
};

const industryOptions: IndustryType[] = ["FINANCIAL", "MANUFACTURING", "HEALTHCARE", "PUBLIC", "TECHNOLOGY"];

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


function renderIndustrySelection(): string {
  return `<section class="industry-selection" aria-labelledby="industry-title">
    <div class="section-kicker">Industry Selection</div>
    <h2 id="industry-title">Industry Profile</h2>
    <p>산업별 중요 위험도를 반영하기 위해 평가 대상 산업을 선택하세요. 기본값은 Technology입니다.</p>
    <div class="industry-options" role="radiogroup" aria-label="Industry Selection">
      ${industryOptions
        .map((industry) => `<label class="industry-option">
        <input type="radio" name="industry" value="${industry}" ${industry === defaultIndustry ? "checked" : ""} />
        <span>${escapeHtml(industryProfiles[industry].label)}</span>
      </label>`)
        .join("")}
    </div>
  </section>`;
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
    :root { color-scheme: dark; --bg: #07111f; --card: #0f1c2e; --panel: #0b1728; --border: #223555; --text: #eaf2ff; --muted: #b8c7dc; --accent: #66d9ef; --button: #2f80ed; --success: #8fffcc; --warn: #ffbd59; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: radial-gradient(circle at top left, #12345a 0, var(--bg) 34rem); color: var(--text); }
    main { width: min(980px, calc(100% - 40px)); margin: 0 auto; padding: 72px 0; }
    .card { border: 1px solid var(--border); border-radius: 28px; background: rgba(15, 28, 46, .92); box-shadow: 0 26px 70px rgba(0, 0, 0, .32); padding: clamp(28px, 5vw, 52px); }
    h1 { font-size: clamp(2rem, 6vw, 4rem); line-height: 1; margin: 0 0 18px; }
    p { color: var(--muted); font-size: 1.08rem; line-height: 1.7; }
    .intro { margin-bottom: 34px; }
    .questions { display: grid; gap: 18px; }
    .industry-selection { margin-bottom: 22px; padding: 22px; border: 1px solid var(--border); border-radius: 22px; background: rgba(102, 217, 239, .08); }
    .section-kicker { margin-bottom: 8px; color: var(--accent); font-weight: 900; letter-spacing: .14em; text-transform: uppercase; }
    h2 { margin: 0 0 10px; }
    .industry-options { display: grid; grid-template-columns: repeat(5, minmax(120px, 1fr)); gap: 10px; margin-top: 16px; }
    .industry-option { display: flex; gap: 10px; align-items: center; min-height: 52px; padding: 12px; border: 1px solid var(--border); border-radius: 14px; background: var(--panel); color: var(--muted); font-weight: 800; cursor: pointer; }
    .industry-option:focus-within, .industry-option:hover { border-color: var(--accent); color: var(--text); }
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
    .form-message { min-height: 28px; margin: 18px 0 0; color: var(--warn); font-weight: 800; }
    @media (max-width: 840px) { .answers, .industry-options { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <section class="card" aria-labelledby="questionnaire-title">
      <h1 id="questionnaire-title">OpenEntry AI Governance Assessment Framework v1</h1>
      <p class="intro">20 Questions → Answer Collection → Scoring Engine → Dashboard. 답변을 선택한 뒤 Generate Dashboard를 누르면 AI Governance Readiness Dashboard로 이동합니다.</p>
      <form id="assessment-form">
        ${renderIndustrySelection()}
        <div class="questions">${assessmentQuestions.map(renderQuestion).join("")}</div>
        <div class="actions">
          <a href="/demo/assessment">Back to Landing</a>
          <button type="submit">Generate Dashboard</button>
        </div>
      </form>
      <p id="form-message" class="form-message" role="status" aria-live="polite"></p>
    </section>
  </main>
  <script>
    const questionIds = ${JSON.stringify(assessmentQuestions.map((question) => question.id))};

    document.getElementById("assessment-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      const message = document.getElementById("form-message");
      const missingCount = questionIds.filter((id) => !formData.has(id)).length;

      if (missingCount > 0) {
        message.textContent = "모든 20개 질문에 답변한 뒤 Dashboard를 생성할 수 있습니다. 남은 문항: " + missingCount;
        return;
      }

      const industry = String(formData.get("industry") || "TECHNOLOGY");
      const answers = [
        { questionId: "industry_" + industry, value: 0 },
        ...questionIds.map((questionId) => ({ questionId, value: Number(formData.get(questionId)) })),
      ];
      message.textContent = "Dashboard 생성 중...";

      const response = await fetch("/assessment/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        message.textContent = "Dashboard 생성에 실패했습니다. 잠시 후 다시 시도해주세요.";
        return;
      }

      const html = await response.text();
      document.open();
      document.write(html);
      document.close();
    });
  </script>
</body>
</html>`;
}
