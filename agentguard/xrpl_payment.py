import os
from typing import Any, Optional

from .xrpl_utils import canonical_json_text, str_to_hex


DEFAULT_TESTNET_URL = "https://s.altnet.rippletest.net:51234"
DEFAULT_MAINNET_URL = "https://s1.ripple.com:51234"


def attach_agentguard_memo(
    tx_payload: dict[str, Any],
    *,
    agent_id: str,
    policy_id: str,
    token_id: str,
    audit_hash: Optional[str] = None,
    request_hash: Optional[str] = None,
    risk_score: Optional[float] = None,
    purpose: str = "",
    policy_hash: Optional[str] = None,
    decision_id: Optional[str] = None,
    risk_level: Optional[str] = None,
) -> dict[str, Any]:
    memo_data = {
        "protocol": "agentguard",
        "version": "0.3",
        "agent_id": agent_id,
        "policy_id": policy_id,
        "token_id": token_id,
        "audit_hash": audit_hash,
        "request_hash": request_hash,
        "risk_score": 0 if risk_score is None else risk_score,
        "purpose": purpose,
        "policy_hash": policy_hash,
        "decision_id": decision_id,
    }
    if risk_level:
        memo_data["risk_level"] = risk_level

    memo = {
        "Memo": {
            "MemoType": str_to_hex("agentguard/action"),
            "MemoFormat": str_to_hex("application/json"),
            "MemoData": str_to_hex(canonical_json_text(memo_data)),
        }
    }

    payload = dict(tx_payload)
    payload["Memos"] = [*payload.get("Memos", []), memo]
    return payload


def build_rlusd_payment_tx(
    *,
    account: str,
    destination: str,
    amount: float,
    currency: str = "RLUSD",
    issuer: Optional[str] = None,
    memo: Optional[str] = None,
) -> dict[str, Any]:
    issuer_address = issuer or os.getenv("XRPL_RLUSD_ISSUER") or os.getenv("XRPL_ISSUED_CURRENCY_ISSUER") or "rTEST_ISSUER"

    tx: dict[str, Any] = {
        "TransactionType": "Payment",
        "Account": account,
        "Destination": destination,
        "Amount": {
            "currency": currency,
            "issuer": issuer_address,
            "value": str(amount),
        },
    }

    if memo:
        tx["Memos"] = [
            {
                "Memo": {
                    "MemoType": str_to_hex("agentguard/note"),
                    "MemoData": str_to_hex(memo),
                }
            }
        ]
    return tx


def build_xrp_payment_tx(
    *,
    account: str,
    destination: str,
    amount_drops: str,
    memo: Optional[str] = None,
) -> dict[str, Any]:
    tx: dict[str, Any] = {
        "TransactionType": "Payment",
        "Account": account,
        "Destination": destination,
        "Amount": amount_drops,
    }

    if memo:
        tx["Memos"] = [
            {
                "Memo": {
                    "MemoType": str_to_hex("agentguard/note"),
                    "MemoData": str_to_hex(memo),
                }
            }
        ]
    return tx


def _convert_raw_memos_to_model(memos: Any) -> Optional[list[Any]]:
    if not memos:
        return None

    from xrpl.models.transactions import Memo

    converted_memos: list[Any] = []
    for memo_entry in memos:
        memo_fields = memo_entry.get("Memo", {}) if isinstance(memo_entry, dict) else {}
        converted_memos.append(
            Memo(
                memo_type=memo_fields.get("MemoType"),
                memo_format=memo_fields.get("MemoFormat"),
                memo_data=memo_fields.get("MemoData"),
            )
        )
    return converted_memos


def _to_payment_kwargs(tx_payload: dict[str, Any]) -> dict[str, Any]:
    amount = tx_payload.get("Amount")
    if isinstance(amount, dict):
        from xrpl.models.amounts import IssuedCurrencyAmount

        amount = IssuedCurrencyAmount(
            currency=amount.get("currency"),
            issuer=amount.get("issuer"),
            value=amount.get("value"),
        )

    return {
        "account": tx_payload.get("Account"),
        "destination": tx_payload.get("Destination"),
        "amount": amount,
        "memos": _convert_raw_memos_to_model(tx_payload.get("Memos")),
    }


def submit_xrpl_transaction(
    tx_payload: dict[str, Any],
    *,
    endpoint: Optional[str] = None,
    signer_seed: Optional[str] = None,
) -> dict[str, Any]:
    try:
        from xrpl.clients import JsonRpcClient
        from xrpl.models.transactions import Payment
        from xrpl.wallet import Wallet
        from xrpl.transaction import submit_and_wait
    except Exception as exc:
        return {"success": False, "error": f"xrpl-py import error: {exc}"}

    xrpl_seed = signer_seed or os.getenv("XRPL_TESTNET_SEED")
    if not xrpl_seed:
        return {"success": False, "error": "XRPL 테스트넷 실행을 위해 XRPL_TESTNET_SEED가 필요합니다."}

    network = os.getenv("XRPL_NETWORK", "testnet").strip().lower()
    default_url = DEFAULT_MAINNET_URL if network == "mainnet" else DEFAULT_TESTNET_URL
    env_url = os.getenv("XRPL_MAINNET_URL") if network == "mainnet" else os.getenv("XRPL_TESTNET_URL")
    client = JsonRpcClient(endpoint or env_url or default_url)
    try:
        wallet = Wallet.from_seed(xrpl_seed)
        payload = dict(tx_payload)
        if not payload.get("Destination"):
            return {"success": False, "error": "invalid_destination"}
        if payload.get("Destination") == wallet.classic_address:
            return {"success": False, "error": "destination_must_not_be_signer"}

        tx_account = payload.get("Account") or wallet.classic_address
        if tx_account != wallet.classic_address:
            return {
                "success": False,
                "error": "signer_account_mismatch",
                "signer_account": wallet.classic_address,
            }
        payload["Account"] = tx_account
        payment = Payment(**_to_payment_kwargs(payload))
        response = submit_and_wait(payment, client, wallet)
        result = response.result
    except Exception as exc:
        return {"success": False, "error": str(exc)}

    tx_hash = result.get("hash") or result.get("tx_json", {}).get("hash")
    if not tx_hash:
        return {"success": False, "error": "tx_hash_missing", "raw": result}

    if result.get("validated") is False:
        return {
            "success": False,
            "error": result.get("meta", {}).get("TransactionResult", "submission_failed"),
            "tx_hash": tx_hash,
            "raw": result,
        }

    return {"success": True, "tx_hash": tx_hash, "raw": result, "signer_account": wallet.classic_address}
