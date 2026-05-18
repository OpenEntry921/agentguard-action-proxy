import logging
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from agentguard.policy.parser.config_loader import load_policy_config
from agentguard.xrpl.checks.destination_checker import check_account_exists, check_new_destination, validate_xrpl_address
from agentguard.xrpl.ledger.ledger_client import XrplLedgerClient, get_ledger_client
from agentguard.xrpl.trustline.trustline_checker import check_legacy_whitelist, check_trustline
from agentguard.explainability import build_execution_explanation


logger = logging.getLogger(__name__)


class PolicyEngine:
    def __init__(self, policy_path: str = "configs/policy.yaml") -> None:
        self.policy_path = Path(policy_path)
        self.policy = self._load_policy()
        self.active_policy_version = str(self.policy.get("policy_version", "unknown"))
        self.active_policy_hash = self._compute_policy_hash(self.policy)
        self.last_reload_time = datetime.now(timezone.utc).isoformat()

    def _load_policy(self) -> Dict[str, Any]:
        return load_policy_config(str(self.policy_path))

    def _compute_policy_hash(self, policy: Dict[str, Any]) -> str:
        canonical = json.dumps(policy, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
        return hashlib.sha256(canonical.encode("utf-8")).hexdigest()

    def reload(self) -> None:
        try:
            loaded = self._load_policy()
        except Exception:
            logger.exception("정책 리로드 실패: 기존 정책 유지")
            return
        self.policy = loaded
        self.active_policy_version = str(self.policy.get("policy_version", "unknown"))
        self.active_policy_hash = self._compute_policy_hash(self.policy)
        self.last_reload_time = datetime.now(timezone.utc).isoformat()

    def evaluate_policy(self, agent_id: str, action: str, amount: int, destination: str, purpose: str, context: Optional[Dict[str, Any]] = None, used_today: int = 0) -> Dict[str, Any]:
        context = context or {}
        self.reload()
        policy = self.policy
        flags = []  # type: List[str]
        blocked_reason = None  # type: Optional[str]
        hard_block = False

        agent_cfg = policy.get("agent", {})
        limits = policy.get("limits", agent_cfg)
        if agent_id != agent_cfg.get("id"):
            return self._blocked("unknown_agent", flags)
        if action not in set(agent_cfg.get("allowed_actions", [])):
            return self._blocked("action_not_allowed", flags)
        if purpose not in set(agent_cfg.get("allowed_purposes", [])):
            return self._blocked("purpose_not_allowed", flags)

        max_amount = int(limits.get("max_amount_drops", 0))
        if int(amount) <= 0 or int(amount) > max_amount:
            flags.append("amount_limit_exceeded")
            blocked_reason = blocked_reason or "amount_policy_violation"
            hard_block = True
        daily_limit = limits.get("daily_limit_drops")
        if daily_limit is not None and used_today + int(amount) > int(daily_limit):
            flags.append("daily_limit_exceeded")
            blocked_reason = blocked_reason or "DAILY_LIMIT_EXCEEDED"

        strict_address = bool(context.get("strict_xrpl_validation", False))
        if not validate_xrpl_address(destination, strict=strict_address):
            blocked_reason = blocked_reason or "invalid_destination"
            hard_block = True

        destination_whitelisted = check_legacy_whitelist(destination, policy)
        if not destination_whitelisted:
            flags.append("destination_not_whitelisted")

        if hard_block:
            return self._blocked(blocked_reason or "policy_violation", list(dict.fromkeys(flags)))

        ledger_client = context.get("ledger_client") or get_ledger_client(policy)
        xrpl_lookup_mode = "LIVE" if isinstance(ledger_client, XrplLedgerClient) else "MOCK"

        effective_policy = dict(policy)
        if context.get("allow_mock_destination", False):
            dest_cfg = dict(effective_policy.get("destination_policy", {}))
            if destination.startswith("rDest") or destination.startswith("rWallet"):
                dest_cfg["require_account_exists"] = False
            effective_policy["destination_policy"] = dest_cfg
        account_check = check_account_exists(destination, ledger_client, effective_policy)
        if not account_check.get("passed"):
            flags.append("destination_account_not_found")
            return self._blocked(str(account_check.get("reason")), list(dict.fromkeys(flags)), account_exists=account_check.get("account_exists"), currency=str(context.get("currency", policy.get("xrpl", {}).get("currency", "XRP"))), xrpl_lookup_mode=xrpl_lookup_mode)

        currency = str(context.get("currency", policy.get("xrpl", {}).get("currency", "XRP")))
        issuer = context.get("issuer")
        trustline = check_trustline(destination, currency, issuer, policy, ledger_client)
        flags.extend(trustline.get("risk_flags", []))
        if not trustline.get("passed"):
            return self._blocked(str(trustline.get("reason")), list(dict.fromkeys(flags)), trustline_check=False, trustline_source=trustline.get("trustline_source"), account_exists=account_check.get("account_exists"), currency=currency, issuer_check=trustline.get("issuer_check"), new_destination=False, xrpl_lookup_mode=xrpl_lookup_mode)

        source_account = str(context.get("wallet_address", ""))
        new_dest = check_new_destination(source_account, destination, ledger_client, policy)
        flags.extend(new_dest.get("risk_flags", []))
        if new_dest.get("blocked"):
            return self._blocked(str(new_dest.get("reason")), list(dict.fromkeys(flags)), trustline_check=bool(trustline.get("passed")), trustline_source=trustline.get("trustline_source"), account_exists=account_check.get("account_exists"), currency=currency, issuer_check=trustline.get("issuer_check"), new_destination=True, xrpl_lookup_mode=xrpl_lookup_mode)

        if context.get("after_hours_execution", datetime.now(timezone.utc).hour < 7 or datetime.now(timezone.utc).hour >= 20):
            flags.append("after_hours_execution")
        if context.get("frequency_spike"):
            flags.append("frequency_spike")
        if context.get("split_transaction_risk"):
            flags.append("split_transaction_risk")

        risk_score = int(new_dest.get("risk_score_delta", 0)) + sum({"after_hours_execution": 20, "frequency_spike": 20, "split_transaction_risk": 20}.get(f, 0) for f in flags)
        thresholds = policy.get("decision_thresholds", {})
        approve_below = int(thresholds.get("approve_below", 30))
        conditional_from = int(thresholds.get("conditional_approval_from", 31))
        block_from = int(thresholds.get("block_from", 70))
        if blocked_reason:
            decision = "BLOCKED"
            reason = blocked_reason
        elif risk_score >= block_from:
            decision, reason = "BLOCKED", "risk_score_blocked"
        elif not destination_whitelisted:
            decision, reason = "CONDITIONAL_APPROVAL", "destination_not_whitelisted_but_valid"
            risk_score = 40
        elif risk_score >= conditional_from and risk_score > approve_below:
            decision, reason = "CONDITIONAL_APPROVAL", "conditional_approval"
        else:
            decision, reason = "APPROVED", None

        explanation = build_execution_explanation(
            decision,
            list(dict.fromkeys(flags)),
            reason,
            {"destination_whitelisted": destination_whitelisted},
        )

        return {
            "decision": decision,
            "risk_score": risk_score,
            "risk_flags": list(dict.fromkeys(flags)),
            "trustline_check": bool(trustline.get("passed")),
            "policy_id": policy.get("policy_id"),
            "policy_version": str(policy.get("policy_version")),
            "policy_source": str(self.policy_path),
            "policy_hash": self.active_policy_hash,
            "applied_limits": {"max_amount_drops": max_amount, "daily_limit_drops": daily_limit},
            "reason": reason,
            "execution_explanation": explanation,
            "xrpl_lookup_mode": xrpl_lookup_mode,
            "xrpl_checks": {
                "account_exists": account_check.get("account_exists"),
                "trustline_check": bool(trustline.get("passed")),
                "trustline_source": trustline.get("trustline_source"),
                "xrpl_lookup_mode": xrpl_lookup_mode,
                "currency": currency,
                "issuer_check": trustline.get("issuer_check", "not_required" if currency == "XRP" else None),
                "new_destination": bool(new_dest.get("is_new_destination")),
            },
        }

    def _blocked(self, reason: str, flags: List[str], trustline_check: bool = False, trustline_source: Optional[str] = None, account_exists: Optional[bool] = None, currency: Optional[str] = None, issuer_check: Any = None, new_destination: bool = False, xrpl_lookup_mode: str = "MOCK") -> Dict[str, Any]:
        explanation = build_execution_explanation("BLOCKED", flags, reason)
        return {
            "decision": "BLOCKED",
            "risk_score": 100,
            "risk_flags": flags,
            "trustline_check": trustline_check,
            "policy_id": self.policy.get("policy_id"),
            "policy_version": str(self.policy.get("policy_version")),
            "policy_source": str(self.policy_path),
            "policy_hash": self.active_policy_hash,
            "applied_limits": {"max_amount_drops": self.policy.get("limits", self.policy.get("agent", {})).get("max_amount_drops"), "daily_limit_drops": self.policy.get("limits", self.policy.get("agent", {})).get("daily_limit_drops")},
            "reason": reason,
            "execution_explanation": explanation,
            "xrpl_lookup_mode": xrpl_lookup_mode,
            "xrpl_checks": {"account_exists": account_exists, "trustline_check": trustline_check, "trustline_source": trustline_source, "xrpl_lookup_mode": xrpl_lookup_mode, "currency": currency, "issuer_check": issuer_check, "new_destination": new_destination},
        }
