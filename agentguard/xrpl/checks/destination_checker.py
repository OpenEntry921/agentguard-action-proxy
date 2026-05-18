from typing import Any, Dict
import logging

from agentguard.xrpl.ledger.ledger_client import XrplLedgerClient

logger = logging.getLogger(__name__)


def _extract_result_wrapper(resp: Dict[str, Any]) -> Dict[str, Any]:
    result = resp.get("result", {}) if isinstance(resp, dict) else {}
    if isinstance(result, dict) and isinstance(result.get("result"), dict):
        return result.get("result", {})
    return result if isinstance(result, dict) else {}


def validate_xrpl_address(destination: str, strict: bool = True) -> bool:
    if not destination:
        return False
    if not strict:
        return destination.startswith("r")
    return destination.startswith("r") and 25 <= len(destination) <= 35


def check_account_exists(destination: str, ledger_client: Any, policy: Dict[str, Any]) -> Dict[str, Any]:
    cfg = policy.get("destination_policy", {})
    if not cfg.get("require_account_exists", False):
        return {"passed": True, "reason": None, "account_exists": None}
    resp = ledger_client.account_info(destination)
    logger.debug("XRPL account_info raw response: %s", resp)
    result = _extract_result_wrapper(resp)
    status = result.get("status")
    account_data = result.get("account_data")
    ok = status == "success" and isinstance(account_data, dict) and bool(account_data)
    is_live_lookup = isinstance(ledger_client, XrplLedgerClient)
    if not is_live_lookup:
        return {"passed": True, "reason": None, "account_exists": "not_checked"}
    if not ok and cfg.get("block_if_account_not_found", True):
        return {"passed": False, "reason": "account_not_found", "account_exists": False}
    return {"passed": True, "reason": None, "account_exists": ok}


def check_new_destination(source_account: str, destination: str, ledger_client: Any, policy: Dict[str, Any]) -> Dict[str, Any]:
    history = policy.get("history_policy", {})
    destination_cfg = policy.get("destination_policy", {})
    if not history.get("detect_new_destination", True):
        return {"is_new_destination": False, "risk_flags": [], "risk_score_delta": 0, "blocked": False, "reason": None}
    if not history.get("enable_account_tx_lookup", False):
        is_new = True
        if not destination_cfg.get("allow_new_destination", True):
            return {"is_new_destination": True, "risk_flags": ["new_destination"], "risk_score_delta": 0, "blocked": True, "reason": "new_destination_blocked"}
        return {"is_new_destination": True, "risk_flags": ["new_destination"], "risk_score_delta": int(destination_cfg.get("new_destination_risk_score", 20)), "blocked": False, "reason": None}
    tx_result = ledger_client.account_tx(source_account, limit=50)
    txs = tx_result.get("result", {}).get("transactions", [])
    for tx in txs:
        tx_body = tx.get("tx", {})
        if tx_body.get("Destination") == destination:
            return {"is_new_destination": False, "risk_flags": [], "risk_score_delta": 0, "blocked": False, "reason": None}
    if not destination_cfg.get("allow_new_destination", True):
        return {"is_new_destination": True, "risk_flags": ["new_destination"], "risk_score_delta": 0, "blocked": True, "reason": "new_destination_blocked"}
    return {"is_new_destination": True, "risk_flags": ["new_destination"], "risk_score_delta": int(destination_cfg.get("new_destination_risk_score", 20)), "blocked": False, "reason": None}
