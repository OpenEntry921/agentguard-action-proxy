#!/usr/bin/env bash
set -euo pipefail

if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

if [ -z "${AGENTGUARD_POLICY_PATH:-}" ]; then
  if [ -f "configs/policy.yaml" ]; then
    export AGENTGUARD_POLICY_PATH="configs/policy.yaml"
  else
    echo "오류: 정책 파일을 찾을 수 없습니다. configs/policy.yaml을 확인하세요."
    exit 1
  fi
fi

echo "사용 정책 파일: $AGENTGUARD_POLICY_PATH"
export USE_XRPL_LIVE_LOOKUP=${USE_XRPL_LIVE_LOOKUP:-true}
export USE_XRPL_SUBMIT=${USE_XRPL_SUBMIT:-true}

echo "AgentGuard 데모 서버를 시작합니다."
echo "웹 데모: http://127.0.0.1:8000/demo"
python3 -m uvicorn agentguard.api:app --host 0.0.0.0 --port 8000 --reload
