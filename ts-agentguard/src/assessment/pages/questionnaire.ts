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
    :root { color-scheme: dark; --bg: #07111f; --card: #0f1c2e; --panel: #0b1728; --border: #223555; --text: #eaf2ff; --muted: #b8c7dc; --accent: #66d9ef; --button: #2f80ed; --success: #8fffcc; --warn: #ffbd59; }
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
    .result-panel { display: none; margin-top: 30px; padding: 24px; border: 1px solid var(--accent); border-radius: 22px; background: rgba(102, 217, 239, .08); }
    .result-panel.visible { display: block; }
    .result-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin: 18px 0; }
    .result-metric { padding: 16px; border: 1px solid var(--border); border-radius: 16px; background: rgba(11, 23, 40, .86); }
    .result-label { color: var(--muted); font-size: .9rem; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
    .result-value { margin-top: 8px; color: var(--text); font-size: 1.35rem; font-weight: 900; }
    pre { overflow-x: auto; margin: 16px 0 0; padding: 18px; border-radius: 16px; background: #050b14; color: var(--success); line-height: 1.5; }
    @media (max-width: 840px) { .answers, .result-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <section class="card" aria-labelledby="questionnaire-title">
      <h1 id="questionnaire-title">OpenEntry AI Governance Assessment Framework v1</h1>
      <p class="intro">20 Questions → Answer Collection → Score Engine. 답변을 선택한 뒤 Continue Assessment를 누르면 페이지 이동 없이 결과 JSON을 표시합니다.</p>
      <form id="assessment-form">
        <div class="questions">${assessmentQuestions.map(renderQuestion).join("")}</div>
        <div class="actions">
          <a href="/demo/assessment">Back to Landing</a>
          <button type="submit">Continue Assessment</button>
        </div>
      </form>
      <section id="assessment-result" class="result-panel" aria-live="polite" aria-labelledby="result-title">
        <h2 id="result-title">Assessment Result</h2>
        <div class="result-grid">
          <div class="result-metric"><div class="result-label">Total Score</div><div id="result-total" class="result-value">0 / 100</div></div>
          <div class="result-metric"><div class="result-label">Risk Level</div><div id="result-risk" class="result-value">-</div></div>
          <div class="result-metric"><div class="result-label">Maturity</div><div id="result-maturity" class="result-value">-</div></div>
        </div>
        <pre id="result-json">{}</pre>
      </section>
    </section>
  </main>
  <script>
    const domainQuestionIds = {
      aiUsage: ["ai_usage_1", "ai_usage_2", "ai_usage_3", "ai_usage_4"],
      dataProtection: ["data_protection_1", "data_protection_2", "data_protection_3", "data_protection_4"],
      accessControl: ["access_control_1", "access_control_2", "access_control_3", "access_control_4"],
      auditTraceability: ["audit_traceability_1", "audit_traceability_2", "audit_traceability_3", "audit_traceability_4"],
      agentRisk: ["agent_risk_1", "agent_risk_2", "agent_risk_3", "agent_risk_4"],
    };

    function scoreFor(ids, answers) {
      return ids.reduce((sum, id) => sum + (answers[id] || 0), 0);
    }

    function levelFor(totalScore, ranges) {
      return ranges.find((range) => totalScore >= range.min && totalScore <= range.max).value;
    }

    function calculateAssessment(answers) {
      const aiUsage = scoreFor(domainQuestionIds.aiUsage, answers);
      const dataProtection = scoreFor(domainQuestionIds.dataProtection, answers);
      const accessControl = scoreFor(domainQuestionIds.accessControl, answers);
      const auditTraceability = scoreFor(domainQuestionIds.auditTraceability, answers);
      const agentRisk = scoreFor(domainQuestionIds.agentRisk, answers);
      const totalScore = aiUsage + dataProtection + accessControl + auditTraceability + agentRisk;

      return {
        totalScore,
        aiUsage,
        dataProtection,
        accessControl,
        auditTraceability,
        agentRisk,
        maturityLevel: levelFor(totalScore, [
          { min: 0, max: 20, value: "Level 1 Ad-hoc" },
          { min: 21, max: 40, value: "Level 2 Controlled" },
          { min: 41, max: 60, value: "Level 3 Managed" },
          { min: 61, max: 80, value: "Level 4 Governed" },
          { min: 81, max: 100, value: "Level 5 Autonomous Governance" },
        ]),
        riskLevel: levelFor(totalScore, [
          { min: 0, max: 20, value: "Critical Risk" },
          { min: 21, max: 40, value: "High Risk" },
          { min: 41, max: 60, value: "Medium Risk" },
          { min: 61, max: 80, value: "Low Risk" },
          { min: 81, max: 100, value: "Optimized" },
        ]),
      };
    }

    document.getElementById("assessment-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const answers = {};
      new FormData(event.currentTarget).forEach((value, key) => {
        answers[key] = Number(value);
      });
      const result = calculateAssessment(answers);
      document.getElementById("result-total").textContent = result.totalScore + " / 100";
      document.getElementById("result-risk").textContent = result.riskLevel;
      document.getElementById("result-maturity").textContent = result.maturityLevel;
      document.getElementById("result-json").textContent = JSON.stringify(result, null, 2);
      document.getElementById("assessment-result").classList.add("visible");
      document.getElementById("assessment-result").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  </script>
</body>
</html>`;
}
