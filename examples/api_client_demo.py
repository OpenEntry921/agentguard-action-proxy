#!/usr/bin/env python3
"""
Manual API flow demo for AgentGuard.

실행 방법 (Python 3.9):
    python3 examples/api_client_demo.py

가정:
- API 서버가 이미 실행 중임
  (예: python3 -m uvicorn agentguard.api:app --reload)
"""

import os
import time
from decimal import Decimal, InvalidOperation
from typing import Any, Dict

import httpx
from xrpl.wallet import Wallet

BASE_URL = "http://127.0.0.1:8000"


def post_json(client: httpx.Client, path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    resp = client.post(f"{BASE_URL}{path}", json=payload)
    resp.raise_for_status()
    return resp.json()


def get_json(client: httpx.Client, path: str) -> Dict[str, Any]:
    resp = client.get(f"{BASE_URL}{path}")
    resp.raise_for_status()
    return resp.json()


def print_step(step: str, data: Any) -> None:
    print(f"\n=== {step} ===")
    print(data)


def resolve_seed_env_var(use_real_submit: bool) -> tuple[str, str]:
    network = os.getenv("XRPL_NETWORK", "testnet").strip().lower()

    if network == "mainnet":
        seed = os.getenv("XRPL_MAINNET_SEED") or os.getenv("XRPL_SEED")
        if not seed:
            raise RuntimeError("XRPL mainnet 사용 시 seed가 필요합니다.")
        return seed, "XRPL_MAINNET_SEED/XRPL_SEED"

    seed = os.getenv("XRPL_TESTNET_SEED")
    if not seed:
        raise RuntimeError("XRPL 테스트넷 seed가 필요합니다.")
    return seed, "XRPL_TESTNET_SEED"


def get_wallet_address(use_real_submit: bool) -> str:
    seed, _ = resolve_seed_env_var(use_real_submit)
    wallet = Wallet.from_seed(seed)
    return wallet.classic_address


def xrp_to_drops(amount_xrp: Any) -> str:
    try:
        drops = (Decimal(str(amount_xrp)) * Decimal("1000000")).quantize(Decimal("1"))
    except (InvalidOperation, ValueError) as exc:
        raise ValueError(f"Invalid XRP amount: {amount_xrp}") from exc
    if drops <= 0:
        raise ValueError("XRP amount must be positive.")
    return str(int(drops))


def build_preview_payload(use_real_submit: bool, destination: str) -> Dict[str, Any]:
    _ = get_wallet_address(use_real_submit)
    payload = {
        "agent_id": "did:openentry:agent:demo",
        "action": "pay",
        "amount": 0.1,
        "currency": "XRP",
        "destination": destination,
        "purpose": "ops",
        "context": {"source": "api_client_demo"},
    }
    if use_real_submit:
        # XRPL submit mode uses native XRP with drops amount on the selected network.
        payload["currency"] = "XRP"
        payload["amount"] = xrp_to_drops(os.getenv("XRPL_XRP_AMOUNT", "0.1"))
        payload["destination"] = os.getenv("XRPL_TESTNET_DESTINATION") or destination
    return payload


def main() -> None:
    use_real_submit = os.getenv("USE_XRPL_SUBMIT", "false").strip().lower() == "true"
    testnet_destination = os.getenv("XRPL_TESTNET_DESTINATION")
    if use_real_submit and not testnet_destination:
        raise SystemExit(
            "USE_XRPL_SUBMIT=true requires XRPL_TESTNET_DESTINATION. "
            "예: export XRPL_TESTNET_DESTINATION=r...."
        )

    default_destination = testnet_destination or "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh"
    high_risk_destination = testnet_destination or "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe"

    if use_real_submit:
        print("Running in XRPL live submit mode: using native XRP")
    else:
        print("Running in demo mode: using RLUSD issued currency")

    with httpx.Client(timeout=30.0) as client:
        # 1) health check
        health = get_json(client, "/health")
        print_step("1) health check", health)

        # 2) preview request
        preview_payload = build_preview_payload(use_real_submit, default_destination)
        preview = post_json(client, "/execution/preview", preview_payload)
        print_step("2) preview request", preview)

        # 3) approved execution request
        approved_payload = dict(preview_payload)

        if use_real_submit:
            max_live_submits = 2
            first_submitted_tx_hash = None
            for idx in range(max_live_submits):
                approved = post_json(client, "/execution/request", approved_payload)
                print_step(f"3) approved execution request ({idx + 1}/{max_live_submits})", approved)

                tx_hash = approved.get("tx_hash")
                submit_status = approved.get("submit_status")
                if submit_status == "SUBMITTED" and tx_hash:
                    first_submitted_tx_hash = tx_hash
                    print_step("3-1) first SUBMITTED tx_hash (success)", {"tx_hash": tx_hash})
                    break

                if idx < max_live_submits - 1:
                    time.sleep(2)

            if first_submitted_tx_hash:
                print("\n=== optional steps skipped ===")
                print("첫 번째 SUBMITTED tx_hash 확인으로 성공 처리. 이후 단계는 optional 입니다.")
                return

            print("\n=== optional steps continue ===")
            print("SUBMITTED tx_hash를 확인하지 못해 optional 단계를 계속 진행합니다.")
        else:
            approved = post_json(client, "/execution/request", approved_payload)
            print_step("3) approved execution request", approved)

        # 4) blocked execution request
        blocked_payload = dict(preview_payload)
        blocked_payload["destination"] = "r3fQpD2YxMHeaA7f2t8oJfN9qQ4w6M8P1R"
        blocked = post_json(client, "/execution/request", blocked_payload)
        print_step("4) blocked execution request", blocked)

        # 5) high-risk request로 approval_id 생성
        warmup_payload = dict(preview_payload)
        warmup_payload["amount"] = 10
        warmup_payload["destination"] = default_destination
        for _ in range(8):
            post_json(client, "/execution/request", warmup_payload)

        high_risk_payload = dict(preview_payload)
        high_risk_payload["amount"] = 40
        high_risk_payload["destination"] = high_risk_destination
        high_risk_payload["context"] = {"source": "api_client_demo_high_risk"}

        high_risk = post_json(client, "/execution/request", high_risk_payload)
        print_step("5) high-risk request", high_risk)

        approval_id = high_risk.get("approval_id")
        if not approval_id:
            raise RuntimeError("Expected approval_id for high-risk request, but none was returned.")

        # 6) approval_id 승인
        approved_by_admin = post_json(client, f"/approval/{approval_id}/approve", {})
        print_step("6) approve pending request", approved_by_admin)

        # 7) audit anchor 조회
        anchor = get_json(client, "/audit/anchor")
        print_step("7) audit anchor", anchor)


if __name__ == "__main__":
    main()
