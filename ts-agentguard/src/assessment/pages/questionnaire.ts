export function assessmentQuestionnaireHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AI Risk Assessment Questionnaire</title>
  <style>
    :root { color-scheme: dark; --bg: #07111f; --card: #0f1c2e; --border: #223555; --text: #eaf2ff; --muted: #b8c7dc; --accent: #66d9ef; --button: #2f80ed; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: radial-gradient(circle at top left, #12345a 0, var(--bg) 34rem); color: var(--text); }
    main { width: min(880px, calc(100% - 40px)); margin: 0 auto; padding: 72px 0; }
    .card { border: 1px solid var(--border); border-radius: 28px; background: rgba(15, 28, 46, .92); box-shadow: 0 26px 70px rgba(0, 0, 0, .32); padding: clamp(28px, 5vw, 52px); }
    h1 { font-size: clamp(2rem, 6vw, 4rem); line-height: 1; margin: 0 0 22px; }
    p, li { color: var(--muted); font-size: 1.08rem; line-height: 1.7; }
    ul { margin: 16px 0 32px; padding-left: 24px; }
    .next { color: var(--accent); font-weight: 800; margin-top: 30px; }
    a { display: inline-flex; align-items: center; min-height: 46px; border-radius: 14px; background: var(--button); color: white; font-weight: 800; padding: 0 20px; text-decoration: none; }
    a:focus, a:hover { background: #1f6fd6; }
  </style>
</head>
<body>
  <main>
    <section class="card" aria-labelledby="questionnaire-title">
      <h1 id="questionnaire-title">AI Risk Assessment Questionnaire</h1>
      <p>This is the starting point for the 20-question assessment.</p>
      <p class="next">Next Sprint:</p>
      <ul>
        <li>5 domains</li>
        <li>20 questions</li>
        <li>0~5 scoring</li>
        <li>Dynamic dashboard generation</li>
      </ul>
      <a href="/demo/assessment">Back to Assessment Dashboard</a>
    </section>
  </main>
</body>
</html>`;
}
