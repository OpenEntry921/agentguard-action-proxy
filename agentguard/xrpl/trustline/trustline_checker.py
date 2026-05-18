from typing import Any, Dict, List, Optional


def check_allowed_currency(currency: str, allowed_currencies: List[str]) -> bool:
    if not allowed_currencies:
        return True
    return currency in set(allowed_currencies)


def check_allowed_issuer(issuer: Optional[str], allowed_issuers: List[str]) -> bool:
    if not allowed_issuers:
        return True
    if not issuer:
        return False
    return issuer in set(allowed_issuers)


def check_authorized_trustline(account_lines: List[Dict[str, Any]], currency: str, issuer: Optional[str]) -> bool:
    for line in account_lines:
        if line.get("currency") != currency:
            continue
        if issuer and line.get("account") != issuer:
            continue
        if bool(line.get("authorized")):
            return True
    return False


def check_legacy_whitelist(destination: str, policy: Dict[str, Any]) -> bool:
    legacy = policy.get("legacy_whitelist", {})
    legacy_allowed = legacy.get("allowed_destinations", [])
    if not legacy_allowed:
        legacy_allowed = policy.get("trustline_whitelist", {}).get("allowed_destinations", [])
    if not legacy.get("enabled", True):
        return True
    return destination in set(legacy_allowed)


def check_trustline(destination: str, currency: str, issuer: Optional[str], policy: Dict[str, Any], ledger_client: Any) -> Dict[str, Any]:
    trustline_policy = policy.get("trustline_policy", {})
    risk_flags = []

    if currency == "XRP":
        if trustline_policy.get("allow_xrp_without_trustline", True):
            return {"passed": True, "reason": None, "risk_flags": [], "trustline_source": "native_xrp_no_trustline_required", "issuer_check": "not_required"}
        return {"passed": False, "reason": "trustline_missing", "risk_flags": ["trustline_missing"], "trustline_source": "native_xrp_policy", "issuer_check": "not_required"}

    allowed_currencies = trustline_policy.get("allowed_currencies", [])
    if not check_allowed_currency(currency, allowed_currencies):
        risk_flags.append("currency_not_allowed")

    allowed_issuers = trustline_policy.get("allowed_issuers", [])
    issuer_allowed = True

    lines_resp = ledger_client.account_lines(destination)
    lines = lines_resp.get("result", {}).get("lines", [])
    if not lines:
        risk_flags.insert(0, "trustline_missing")
        return {"passed": False, "reason": risk_flags[0], "risk_flags": risk_flags, "trustline_source": "xrpl_account_lines_lookup", "issuer_check": issuer_allowed}

    matched = [line for line in lines if line.get("currency") == currency and (not issuer or line.get("account") == issuer)]
    if not matched and trustline_policy.get("require_trustline", False):
        risk_flags.insert(0, "trustline_missing")

    issuer_allowed = True
    if allowed_issuers:
        issuer_allowed = any(line.get("account") in set(allowed_issuers) for line in lines if line.get("currency") == currency)
    if not issuer_allowed:
        risk_flags.append("issuer_not_allowed")

    if trustline_policy.get("require_authorized_trustline", False) and not check_authorized_trustline(lines, currency, issuer):
        risk_flags.append("trustline_not_authorized")

    if risk_flags:
        return {"passed": False, "reason": risk_flags[0], "risk_flags": risk_flags, "trustline_source": "xrpl_account_lines_lookup", "issuer_check": issuer_allowed}
    return {"passed": True, "reason": None, "risk_flags": [], "trustline_source": "xrpl_account_lines_lookup", "issuer_check": issuer_allowed}
