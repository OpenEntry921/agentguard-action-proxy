from typing import Any, Dict, Iterable, Optional


BLOCK_REASON_MESSAGES = {
    "amount_limit_exceeded": "송금 금액이 허용된 정책 한도를 초과했습니다.",
    "amount_policy_violation": "송금 금액이 허용된 정책 한도를 초과했습니다.",
    "invalid_destination": "유효하지 않은 XRPL 주소입니다.",
    "destination_account_not_found": "XRPL 원장에서 계정을 찾을 수 없습니다.",
    "unknown_agent": "등록되지 않은 Agent DID입니다.",
}


def _clean_flags(risk_flags: Optional[Iterable[str]]) -> list[str]:
    return [str(flag) for flag in (risk_flags or []) if str(flag).strip()]


def build_execution_explanation(
    decision: str,
    risk_flags: Optional[Iterable[str]],
    reason: Optional[str],
    context: Optional[Dict[str, Any]] = None,
) -> str:
    ctx = context or {}
    flags = _clean_flags(risk_flags)
    reason_key = str(reason or "").strip()

    if decision == "APPROVED":
        parts = []
        if ctx.get("destination_whitelisted", True):
            parts.append("사전 승인된 목적지 주소입니다.")
        parts.append("송금 금액이 정책 한도 내에 있습니다.")
        parts.append("요청이 정상적으로 승인되었습니다.")
        return " ".join(parts)

    if decision == "CONDITIONAL_APPROVAL":
        return "목적지 주소는 유효하지만 사전 승인 목록에는 없습니다. 사용자 확인 후 실행할 수 있습니다."

    if decision == "BLOCKED":
        for key in flags + [reason_key]:
            if key in BLOCK_REASON_MESSAGES:
                return BLOCK_REASON_MESSAGES[key]
        return "정책 검증 조건을 충족하지 못해 실행이 차단되었습니다."

    return "정책 평가 결과를 확인할 수 없습니다."
