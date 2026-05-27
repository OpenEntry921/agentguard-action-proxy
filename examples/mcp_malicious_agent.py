from __future__ import annotations

import argparse
import json
from typing import Any

from mcp_attack_vectors import SCENARIOS, get_attack_payload

DEFAULT_BASE_URL = "http://127.0.0.1:8000"

SCENARIO_META = {
    "token_theft": {"title": "GitHub Token Theft Attempt", "desc_ko": "오염된 MCP Tool 응답을 신뢰하고 GitHub token 접근을 시도합니다."},
    "cicd_attack": {"title": "CI/CD Workflow Tampering", "desc_ko": "오염된 지시에 따라 CI/CD 워크플로우 변조를 시도합니다."},
    "api_key_leak": {"title": "API Key Exfiltration", "desc_ko": "민감 정보(.env.production) 유출 action을 생성합니다(모의)."},
    "automation_abuse": {"title": "Automation Abuse", "desc_ko": "대량 자동화 작업 남용성 action을 시도합니다."},
}


def _j(data: Any) -> str:
    return json.dumps(data, ensure_ascii=False, indent=2)


def _post_json(url: str, payload: dict[str, Any]) -> dict[str, Any]:
    import urllib.error
    import urllib.request

    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url=url, data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            text = resp.read().decode("utf-8")
            return {"status": resp.getcode(), "text": text, "json": json.loads(text), "connection_error": False}
    except urllib.error.HTTPError as err:
        text = err.read().decode("utf-8") if err.fp else str(err)
        return {"status": err.code, "text": text, "json": None, "connection_error": False}
    except urllib.error.URLError:
        return {"status": 0, "text": "", "json": None, "connection_error": True}


def _result_suffix(decision: str) -> str:
    if decision == "DENY":
        return "BLOCKED BEFORE EXECUTION"
    if decision == "REVIEW_REQUIRED":
        return "HUMAN REVIEW REQUIRED"
    return "ALLOWED - check policy coverage"


def run_scenario(base_url: str, scenario: str, execute: bool) -> None:
    payload = get_attack_payload(scenario)
    meta = SCENARIO_META[scenario]

    print("\n" + "=" * 84)
    print(f"[시나리오] {meta['title']}")
    print(f"[AI Agent] {meta['desc_ko']}")
    print("[AgentGuard] Runtime interception: 실행 전 가로채기")
    print("[요청] POST /actions/preview")
    print(_j(payload))

    preview_res = _post_json(f"{base_url}/actions/preview", payload)
    if preview_res["connection_error"]:
        print("AgentGuard 서버가 실행 중이지 않습니다. 먼저 python -m uvicorn agentguard.api:app --reload 를 실행하세요.")
        return
    if preview_res["status"] >= 400:
        print(f"[HTTP 오류] status={preview_res['status']}")
        print(preview_res["text"])
        return

    res_json = preview_res["json"]
    decision = res_json["decision"]
    print("[응답] Preview Result")
    print(f"- decision: {res_json['decision']}")
    print(f"- risk_score: {res_json['risk_score']}")
    print(f"- risk_level: {res_json['risk_level']}")
    print(f"- risk_factors: {_j(res_json['risk_factors'])}")
    print(f"- matched_policies: {_j(res_json['matched_policies'])}")
    print(f"- reason: {res_json['reason']}")
    print(f"[결과] {decision} / {_result_suffix(decision)}")

    if not execute:
        return

    execute_payload = {"action_request": payload, "execution_token": "mock-execution-token-for-demo"}
    print("[요청] POST /actions/execute (--execute enabled, still mock flow)")
    exec_res = _post_json(f"{base_url}/actions/execute", execute_payload)
    if exec_res["connection_error"]:
        print("AgentGuard 서버가 실행 중이지 않습니다. 먼저 python -m uvicorn agentguard.api:app --reload 를 실행하세요.")
        return
    if exec_res["status"] >= 400:
        print(f"[HTTP 오류] status={exec_res['status']}")
        print(exec_res["text"])
        return
    print("[응답] Execute Result")
    print(_j(exec_res["json"]))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="MCP malicious AI-agent safe mock simulator")
    parser.add_argument("--scenario", choices=[*SCENARIOS, "all"], default="all")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="default: http://127.0.0.1:8000")
    parser.add_argument("--execute", action="store_true", default=False, help="Also call /actions/execute (default: preview only)")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    selected = list(SCENARIOS) if args.scenario == "all" else [args.scenario]
    base_url = args.base_url.rstrip("/")
    for scenario in selected:
        run_scenario(base_url=base_url, scenario=scenario, execute=args.execute)


if __name__ == "__main__":
    main()
