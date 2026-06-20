export function assessmentLandingHtml(): string {
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OpenEntry AI Risk Assessment</title>
  <style>
    :root { color-scheme: dark; --bg: #07111f; --card: #0f1c2e; --border: #223555; --text: #eaf2ff; --muted: #b8c7dc; --accent: #66d9ef; --button: #2f80ed; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: radial-gradient(circle at top left, #12345a 0, var(--bg) 34rem); color: var(--text); }
    main { width: min(980px, calc(100% - 40px)); margin: 0 auto; padding: 72px 0; }
    .card { border: 1px solid var(--border); border-radius: 28px; background: rgba(15, 28, 46, .92); box-shadow: 0 26px 70px rgba(0, 0, 0, .32); padding: clamp(28px, 5vw, 56px); }
    .eyebrow { color: var(--accent); font-size: .9rem; font-weight: 800; letter-spacing: .16em; margin-bottom: 18px; text-transform: uppercase; }
    h1 { font-size: clamp(2.25rem, 7vw, 5rem); line-height: .95; margin: 0 0 22px; }
    p { color: var(--muted); font-size: 1.15rem; line-height: 1.7; margin: 0; }
    .stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin: 34px 0; }
    .stat { border: 1px solid var(--border); border-radius: 18px; background: rgba(7, 17, 31, .54); padding: 20px; text-align: center; }
    .stat strong { display: block; color: var(--text); font-size: 2rem; line-height: 1; margin-bottom: 8px; }
    .stat span { color: var(--muted); font-weight: 700; }
    .button { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; border-radius: 14px; background: var(--button); color: white; font-weight: 800; padding: 0 22px; text-decoration: none; box-shadow: 0 14px 34px rgba(47, 128, 237, .32); }
    .button:focus, .button:hover { background: #1f6fd6; }
    @media (max-width: 700px) { .stats { grid-template-columns: 1fr; } main { padding: 36px 0; } }
  </style>
</head>
<body>
  <main>
    <section class="card" aria-labelledby="assessment-title">
      <div class="eyebrow">OpenEntry AI Risk Assessment</div>
      <h1 id="assessment-title">AGAF Executive Dashboard</h1>
      <p>25개 문항으로 AI 거버넌스 위험과 실행 우선순위를 빠르게 진단합니다.</p>
      <div class="stats" aria-label="Assessment overview">
        <div class="stat"><strong>5</strong><span>5개 영역</span></div>
        <div class="stat"><strong>25</strong><span>25개 질문</span></div>
        <div class="stat"><strong>5분</strong><span>약 5분 소요</span></div>
      </div>
      <a class="button" href="/assessment/start">Start Assessment</a>
    </section>
  </main>
</body>
</html>`;
}
