import os
import time
import hashlib
from typing import Any, Optional
import uuid

from .audit import AuditRecord, MerkleAuditLog
from .crypto import canonical_json
from .crypto import IdentityManager
from .policy import Policy, PolicyEngine, normalize_amount_for_policy
from .policy_engine import PolicyEngine as RuntimePolicyEngine
from .token import ActionToken, TokenIssuer
from .xrpl_payment import build_rlusd_payment_tx, build_xrp_payment_tx, attach_agentguard_memo, submit_xrpl_transaction


def _build_payment_tx(account: str, destination: str, amount: float, currency: str) -> dict[str, Any]:
    if currency == "XRP":
        amount_drops = str(int(round(float(amount) * 1_000_000)))
        return build_xrp_payment_tx(account=account, destination=destination, amount_drops=amount_drops)
    return build_rlusd_payment_tx(
        account=account,
        destination=destination,
        amount=amount,
        currency=currency,
    )


def _default_runtime_currency(runtime_policy_engine: RuntimePolicyEngine) -> str:
    return str(runtime_policy_engine.policy.get("xrpl", {}).get("currency", "XRP")).strip() or "XRP"


def is_test_or_mock_mode() -> bool:
    return bool(os.getenv("PYTEST_CURRENT_TEST")) or os.getenv("USE_XRPL_SUBMIT", "false").lower() != "true"


def _normalize_request_amount_for_policy(request: dict[str, Any]) -> dict[str, Any]:
    normalized_request = dict(request)
    amount = normalized_request.get("amount")
    currency = str(normalized_request.get("currency", ""))
    normalized_amount, raw_amount = normalize_amount_for_policy(amount, currency)
    normalized_request["amount_raw"] = raw_amount
    normalized_request["amount_normalized"] = normalized_amount
    normalized_request["amount"] = normalized_amount
    return normalized_request


class AgentGuardGateway:
    """Integrated MVP Gateway.

    Flow:
    1. Policy check
    2. Action token issue
    3. XRPL tx payload build
    4. Audit log append
    """

    def __init__(self, policy: Policy):
        self.private_key, self.public_key = IdentityManager.generate_key_pair()
        self.policy_engine = PolicyEngine(policy)
        self.runtime_policy_engine = RuntimePolicyEngine(os.getenv("AGENTGUARD_POLICY_PATH", "configs/policy.yaml"))
        self.token_issuer = TokenIssuer(self.private_key, self.public_key)
        self.audit_log = MerkleAuditLog()
        self.approval_requests: dict[str, dict[str, Any]] = {}

    def create_action_request(
        self,
        *,
        agent_id: str,
        wallet_address: str,
        action: str,
        amount: float,
        currency: str,
        destination: str,
        purpose: str,
        context: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        request = {
            "agent_id": agent_id,
            "wallet_address": wallet_address,
            "action": action,
            "amount": amount,
            "currency": currency,
            "destination": destination,
            "purpose": purpose,
            "context": context or {},
            "timestamp": int(time.time()),
            "merchant": destination,
        }
        request["request_hash"] = hashlib.sha256(canonical_json(request)).hexdigest()
        return request


    def create_approval_request(
        self,
        *,
        request: dict[str, Any],
        reason: str,
        risk_score: int,
        risk_flags: list[str],
    ) -> str:
        approval_id = str(uuid.uuid4())
        created_at = int(time.time())
        approval_request = {
            "approval_id": approval_id,
            "request_hash": request["request_hash"],
            "agent_id": request.get("agent_id"),
            "wallet_address": request.get("wallet_address"),
            "action": request.get("action"),
            "amount": request.get("amount"),
            "currency": request.get("currency"),
            "destination": request.get("destination"),
            "reason": reason,
            "risk_score": risk_score,
            "risk_flags": risk_flags,
            "status": "PENDING",
            "created_at": created_at,
            "expires_at": created_at + 3600,
            "request": dict(request),
        }
        self.approval_requests[approval_id] = approval_request
        self.append_audit_record(
            agent_id=request.get("agent_id", ""), wallet_address=request.get("wallet_address", ""),
            action=request.get("action", ""), amount=float(request.get("amount", 0)),
            currency=request.get("currency", ""), destination=request.get("destination", ""),
            policy_id="default_policy", token_id=None, decision="REQUIRE_APPROVAL",
            tx_hash=None, reason=reason, request_hash=request["request_hash"], tx_payload_exists=False,
            risk_score=risk_score, risk_flags=risk_flags,
        )
        self.audit_log.records[-1].request["approval_id"] = approval_id
        self.audit_log.records[-1].record_hash = self.audit_log.record_hash(self.audit_log.records[-1])
        return approval_id

    def get_approval_request(self, approval_id: str) -> Optional[dict[str, Any]]:
        return self.approval_requests.get(approval_id)

    def expire_approval_requests(self) -> None:
        now = int(time.time())
        for approval in self.approval_requests.values():
            if approval["status"] == "PENDING" and int(approval["expires_at"]) <= now:
                approval["status"] = "EXPIRED"
                self.audit_log.append(AuditRecord(
                    status="EXPIRED",
                    agent_did=approval.get("agent_id", ""),
                    request={"approval_id": approval["approval_id"], "request_hash": approval["request_hash"]},
                    reason="APPROVAL_EXPIRED",
                    token_id=None,
                    timestamp=time.time(),
                ))

    def approve_request(self, approval_id: str) -> dict[str, Any]:
        self.expire_approval_requests()
        approval = self.approval_requests.get(approval_id)
        if not approval:
            return {"approved": False, "reason": "APPROVAL_NOT_FOUND"}
        if approval["status"] != "PENDING":
            return {"approved": False, "reason": f"INVALID_APPROVAL_STATUS:{approval['status']}"}

        approval["status"] = "APPROVED"
        request = approval["request"]
        token = self.token_issuer.issue_token(approval["agent_id"], request)
        tx_payload = _build_payment_tx(
            account=approval["wallet_address"],
            destination=approval["destination"],
            amount=float(approval["amount"]),
            currency=approval.get("currency") or _default_runtime_currency(self.runtime_policy_engine),
        )
        tx_payload = attach_agentguard_memo(
            tx_payload,
            agent_id=approval["agent_id"],
            policy_id="default_policy",
            token_id=token.payload["jti"],
            request_hash=approval["request_hash"],
            purpose=request.get("purpose", ""),
            risk_level="approved_after_review",
        )
        use_real_submit = os.getenv("USE_XRPL_SUBMIT", "false").strip().lower() == "true"
        if os.getenv("PYTEST_CURRENT_TEST"):
            use_real_submit = False
        submit_meta: dict[str, Any] = {"tx_hash": None, "submit_status": "MOCK", "submit_error": None}
        if use_real_submit:
            submit_result = submit_xrpl_transaction(tx_payload)
            if submit_result.get("success"):
                submit_meta["tx_hash"] = submit_result.get("tx_hash")
                submit_meta["submit_status"] = "SUBMITTED"
            else:
                submit_meta["submit_status"] = "FAILED"
                submit_meta["submit_error"] = submit_result.get("error")

        self.audit_log.append(AuditRecord(
            status="APPROVED_AFTER_HUMAN_APPROVAL",
            agent_did=approval["agent_id"],
            request={
                "approval_id": approval_id,
                "request_hash": approval["request_hash"],
                "tx_hash": submit_meta["tx_hash"],
                "submit_status": submit_meta["submit_status"],
                "submit_error": submit_meta["submit_error"],
            },
            reason="HUMAN_APPROVED",
            token_id=token.payload["jti"],
            timestamp=time.time(),
        ))
        return {"approved": True, "approval_id": approval_id, "token": token, "tx_payload": tx_payload, **submit_meta}

    def reject_request(self, approval_id: str) -> dict[str, Any]:
        self.expire_approval_requests()
        approval = self.approval_requests.get(approval_id)
        if not approval:
            return {"approved": False, "reason": "APPROVAL_NOT_FOUND"}
        if approval["status"] != "PENDING":
            return {"approved": False, "reason": f"INVALID_APPROVAL_STATUS:{approval['status']}"}
        approval["status"] = "REJECTED"
        self.audit_log.append(AuditRecord(
            status="REJECTED_BY_HUMAN",
            agent_did=approval["agent_id"],
            request={"approval_id": approval_id, "request_hash": approval["request_hash"]},
            reason="HUMAN_REJECTED",
            token_id=None,
            timestamp=time.time(),
        ))
        return {"approved": False, "approval_id": approval_id, "decision": "REJECTED"}

    def check_destination_allowed(self, request: dict[str, Any]) -> tuple[bool, Optional[str]]:
        destination = request.get("destination", "")
        if self.policy_engine.policy.allowed_destinations and destination not in self.policy_engine.policy.allowed_destinations:
            return False, "DESTINATION_NOT_ALLOWED"
        return True, None

    def check_daily_limit(self, request: dict[str, Any]) -> tuple[bool, Optional[str]]:
        daily_limit = self.policy_engine.policy.daily_limit
        if daily_limit is None:
            return True, None

        now = int(time.time())
        start_of_day = now - (now % 86400)
        amount = float(request.get("amount", 0))
        current_agent_id = request.get("agent_id")
        current_wallet_address = request.get("wallet_address")

        used_today = 0.0
        for record in self.audit_log.records:
            record_ts = int(record.timestamp)
            if record_ts < start_of_day or record.status != "APPROVED":
                continue
            record_agent_id = record.request.get("agent_id")
            record_wallet_address = record.request.get("wallet_address")
            if current_agent_id == record_agent_id or current_wallet_address == record_wallet_address:
                used_today += float(record.request.get("amount", 0))

        if used_today + amount > daily_limit:
            return False, "DAILY_LIMIT_EXCEEDED"
        return True, None

    def append_audit_record(
        self,
        *,
        agent_id: str,
        wallet_address: str,
        action: str,
        amount: float,
        currency: str,
        destination: str,
        policy_id: str,
        token_id: Optional[str],
        decision: str,
        tx_hash: Optional[str],
        reason: Optional[str],
        request_hash: Optional[str],
        tx_payload_exists: bool,
        risk_score: int = 0,
        risk_flags: Optional[list[str]] = None,
    ) -> str:
        request = {
            "agent_id": agent_id,
            "wallet_address": wallet_address,
            "action": action,
            "amount": amount,
            "currency": currency,
            "destination": destination,
            "policy_id": policy_id,
            "decision": decision,
            "reason": reason,
            "token_id": token_id,
            "tx_payload_exists": tx_payload_exists,
            "request_hash": request_hash,
            "risk_score": risk_score,
            "risk_flags": risk_flags or [],
        }
        record = AuditRecord(
            status=decision,
            agent_did=agent_id,
            request=request,
            reason=reason,
            token_id=token_id,
            timestamp=time.time(),
        )
        return self.audit_log.append(record)

    def detect_new_destination_risk(self, request: dict[str, Any]) -> bool:
        destination = request.get("destination") or request.get("merchant")
        if not destination:
            return False
        current_agent_id = request.get("agent_id")
        current_wallet_address = request.get("wallet_address")
        for record in self.audit_log.records:
            rec_destination = record.request.get("destination") or record.request.get("merchant")
            if rec_destination != destination:
                continue
            rec_agent_id = record.request.get("agent_id") or record.agent_did
            rec_wallet_address = record.request.get("wallet_address")
            if current_agent_id == rec_agent_id or current_wallet_address == rec_wallet_address:
                return False
        return True

    def detect_amount_spike(self, request: dict[str, Any], min_history: int = 3) -> bool:
        current_amount = float(request.get("amount", 0))
        current_agent_id = request.get("agent_id")
        current_wallet_address = request.get("wallet_address")
        historical_amounts: list[float] = []
        for record in self.audit_log.records:
            rec_agent_id = record.request.get("agent_id") or record.agent_did
            rec_wallet_address = record.request.get("wallet_address")
            if current_agent_id != rec_agent_id and current_wallet_address != rec_wallet_address:
                continue
            historical_amounts.append(float(record.request.get("amount", 0)))
        if len(historical_amounts) < min_history:
            return False
        avg = sum(historical_amounts) / len(historical_amounts)
        return avg > 0 and current_amount >= 3 * avg

    def detect_frequency_spike(self, request: dict[str, Any], window_seconds: int = 600, threshold: int = 5) -> bool:
        current_agent_id = request.get("agent_id")
        current_wallet_address = request.get("wallet_address")
        now = int(request.get("timestamp", time.time()))
        count = 0
        for record in self.audit_log.records:
            record_ts = int(record.timestamp)
            if now - record_ts > window_seconds:
                continue
            rec_agent_id = record.request.get("agent_id") or record.agent_did
            rec_wallet_address = record.request.get("wallet_address")
            if current_agent_id == rec_agent_id or current_wallet_address == rec_wallet_address:
                count += 1
        return count >= threshold

    def detect_split_transaction(self, request: dict[str, Any], window_seconds: int = 1800) -> bool:
        destination = request.get("destination") or request.get("merchant")
        if not destination:
            return False
        now = int(request.get("timestamp", time.time()))
        current_amount = float(request.get("amount", 0))
        total = current_amount
        for record in self.audit_log.records:
            record_ts = int(record.timestamp)
            if now - record_ts > window_seconds:
                continue
            rec_destination = record.request.get("destination") or record.request.get("merchant")
            if rec_destination == destination:
                total += float(record.request.get("amount", 0))
        policy = self.policy_engine.policy
        per_tx_limit = float(policy.max_amount)
        near_per_tx = total >= 0.9 * per_tx_limit
        near_daily = policy.daily_limit is not None and total >= 0.9 * float(policy.daily_limit)
        return near_per_tx or near_daily

    def calculate_anomaly_score(self, request: dict[str, Any]) -> tuple[int, list[str]]:
        context = request.get("context") or {}
        if context.get("demo_risk_mode") is True:
            return (
                int(context.get("simulated_risk_score", 40)),
                list(context.get("simulated_flags", ["new_destination"])),
            )
        score = 0
        flags: list[str] = []
        if self.detect_new_destination_risk(request):
            score += 30
            flags.append("new_destination")
        if self.detect_amount_spike(request):
            score += 30
            flags.append("amount_spike")
        if self.detect_frequency_spike(request):
            score += 20
            flags.append("frequency_spike")
        if context.get("split_transaction_risk"):
            score += 30
            flags.append("split_transaction_risk")
        if context.get("after_hours_execution"):
            score += 10
            flags.append("after_hours_execution")
        return score, flags

    def decide_risk_action(self, is_policy_ok: bool, policy_reason: Optional[str], risk_score: int) -> tuple[str, Optional[str]]:
        if not is_policy_ok:
            return "BLOCKED", policy_reason
        if risk_score >= 40:
            return "REQUIRE_APPROVAL", "RISK_SCORE_THRESHOLD"
        if risk_score >= 31:
            return "CONDITIONAL_APPROVAL", "CONDITIONAL_RISK_ALLOWED"
        return "APPROVED", None

    def process_action(
        self,
        *,
        agent_id: str,
        wallet_address: str,
        action: str,
        amount: float,
        currency: str,
        destination: str,
        purpose: str,
        context: Optional[dict[str, Any]] = None,
        policy_id: str = "default_policy",
    ) -> dict[str, Any]:
        request = self.create_action_request(
            agent_id=agent_id,
            wallet_address=wallet_address,
            action=action,
            amount=amount,
            currency=currency,
            destination=destination,
            purpose=purpose,
            context=context,
        )

        is_ok, reason = self.policy_engine.check_policy(request)
        if not is_ok:
            self.append_audit_record(
                agent_id=agent_id, wallet_address=wallet_address, action=action, amount=amount,
                currency=currency, destination=destination, policy_id=policy_id, token_id=None,
                decision="BLOCKED", tx_hash=None, reason=reason, request_hash=request["request_hash"], tx_payload_exists=False,
            )
            return {"approved": False, "decision": "BLOCKED", "reason": reason, "request": request}
        destination_ok, destination_reason = self.check_destination_allowed(request)
        if not destination_ok:
            self.append_audit_record(
                agent_id=agent_id, wallet_address=wallet_address, action=action, amount=amount,
                currency=currency, destination=destination, policy_id=policy_id, token_id=None,
                decision="BLOCKED", tx_hash=None, reason=destination_reason, request_hash=request["request_hash"], tx_payload_exists=False,
            )
            return {"approved": False, "decision": "BLOCKED", "reason": destination_reason, "request": request}
        limit_ok, limit_reason = self.check_daily_limit(request)
        if not limit_ok:
            self.append_audit_record(
                agent_id=agent_id, wallet_address=wallet_address, action=action, amount=amount,
                currency=currency, destination=destination, policy_id=policy_id, token_id=None,
                decision="BLOCKED", tx_hash=None, reason=limit_reason, request_hash=request["request_hash"], tx_payload_exists=False,
            )
            return {"approved": False, "decision": "BLOCKED", "reason": limit_reason, "request": request}

        risk_score, risk_flags = self.calculate_anomaly_score(request)
        decision, decision_reason = self.decide_risk_action(True, None, risk_score)
        if decision == "REQUIRE_APPROVAL":
            approval_id = self.create_approval_request(
                request=request,
                reason=decision_reason or "RISK_SCORE_THRESHOLD",
                risk_score=risk_score,
                risk_flags=risk_flags,
            )
            return {"approved": False, "decision": decision, "reason": decision_reason, "request": request, "approval_id": approval_id}
        if decision == "CONDITIONAL_APPROVAL":
            token = self.token_issuer.issue_token(agent_id, request)
            tx_payload = _build_payment_tx(
                account=wallet_address,
                destination=destination,
                amount=amount,
                currency=currency,
            )
            tx_payload = attach_agentguard_memo(
                tx_payload,
                agent_id=agent_id,
                policy_id=policy_id,
                token_id=token.payload["jti"],
                request_hash=None,
                purpose=purpose,
                risk_level="conditional",
            )
            self.append_audit_record(
                agent_id=agent_id, wallet_address=wallet_address, action=action, amount=amount,
                currency=currency, destination=destination, policy_id=policy_id, token_id=token.payload["jti"],
                decision="CONDITIONAL_APPROVAL", tx_hash=None, reason=decision_reason, request_hash=request["request_hash"], tx_payload_exists=True,
                risk_score=risk_score, risk_flags=risk_flags,
            )
            return {"approved": True, "decision": decision, "token": token, "tx_payload": tx_payload, "request": request}

        token = self.token_issuer.issue_token(agent_id, request)
        tx_payload = _build_payment_tx(
            account=wallet_address,
            destination=destination,
            amount=amount,
            currency=currency,
        )
        tx_payload = attach_agentguard_memo(
            tx_payload,
            agent_id=agent_id,
            policy_id=policy_id,
            token_id=token.payload["jti"],
            request_hash=None,
            purpose=purpose,
            risk_level="conditional" if decision == "CONDITIONAL_APPROVAL" else None,
        )

        self.append_audit_record(
            agent_id=agent_id, wallet_address=wallet_address, action=action, amount=amount,
            currency=currency, destination=destination, policy_id=policy_id, token_id=token.payload["jti"],
            decision="APPROVED", tx_hash=None, reason="policy_ok", request_hash=request["request_hash"], tx_payload_exists=True,
            risk_score=risk_score, risk_flags=risk_flags,
        )
        return {"approved": True, "decision": decision, "token": token, "tx_payload": tx_payload, "request": request}

    def request_execution(self, agent_did: str, request: dict[str, Any]) -> Optional[ActionToken]:
        request = _normalize_request_amount_for_policy(dict(request))
        request["request_hash"] = request.get("request_hash") or hashlib.sha256(canonical_json(request)).hexdigest()
        if self.policy_engine.policy.max_amount != float("inf"):
            return self._request_execution_legacy(agent_did, request)
        self.runtime_policy_engine.reload()

        used_today = 0
        now = int(time.time())
        start_of_day = now - (now % 86400)
        current_agent_id = request.get("agent_id")
        current_wallet_address = request.get("wallet_address")
        for record in self.audit_log.records:
            if record.status != "APPROVED":
                continue
            if int(record.timestamp) < start_of_day:
                continue
            rec_agent_id = record.request.get("agent_id")
            rec_wallet_address = record.request.get("wallet_address")
            if current_agent_id == rec_agent_id or current_wallet_address == rec_wallet_address:
                used_today += int(float(record.request.get("amount_raw", record.request.get("amount", 0))))

        currency = str(request.get("currency", ""))
        amount_for_policy = int(float(request.get("amount_raw" if currency == "XRP" else "amount", 0)))
        policy_eval = self.runtime_policy_engine.evaluate_policy(
            agent_id=request.get("agent_id", agent_did),
            action=request.get("action", ""),
            amount=amount_for_policy,
            destination=request.get("destination", ""),
            purpose=request.get("purpose", ""),
            context=request.get("context", {}),
            used_today=used_today,
        )

        decision = policy_eval.get("decision", "BLOCKED")
        token: Optional[ActionToken] = None
        decision_reason: Optional[str] = policy_eval.get("reason")
        tx_payload_exists = False
        risk_score = int(policy_eval.get("risk_score", 0))
        risk_flags: list[str] = list(policy_eval.get("risk_flags", []))

        if decision == "BLOCKED":
            audit_request = dict(request)
            audit_request["decision"] = decision
            audit_request["tx_payload_exists"] = tx_payload_exists
            audit_request["risk_score"] = risk_score
            audit_request["risk_flags"] = risk_flags
            audit_request["tx_hash"] = None
            audit_request["submit_status"] = "BLOCKED"
            audit_request["submit_error"] = None
            audit_request["policy_id"] = policy_eval.get("policy_id")
            audit_request["policy_version"] = policy_eval.get("policy_version")
            audit_request["policy_source"] = policy_eval.get("policy_source")
            audit_request["applied_limits"] = policy_eval.get("applied_limits")
            audit_request["trustline_check"] = policy_eval.get("trustline_check")
            self.audit_log.append(
                AuditRecord(
                    status=decision,
                    agent_did=agent_did,
                    request=audit_request,
                    reason=decision_reason,
                    token_id=None,
                    timestamp=time.time(),
                )
            )
            return None
        if decision == "REQUIRE_APPROVAL":
            approval_id = self.create_approval_request(
                request=request,
                reason=decision_reason or "RISK_SCORE_THRESHOLD",
                risk_score=risk_score,
                risk_flags=risk_flags,
            )
            self.approval_requests[approval_id]["request"] = dict(request)
            return None

        token = self.token_issuer.issue_token(agent_did, request)
        tx_payload_exists = True
        amount = float(request.get("amount", 0))
        currency = request.get("currency") or _default_runtime_currency(self.runtime_policy_engine)
        amount_raw = request.get("amount_raw")
        if currency == "XRP" and amount_raw is not None:
            tx_payload = build_xrp_payment_tx(
                account=request.get("wallet_address", ""),
                destination=request.get("destination", ""),
                amount_drops=amount_raw,
            )
        else:
            tx_payload = _build_payment_tx(
                account=request.get("wallet_address", ""),
                destination=request.get("destination", ""),
                amount=amount,
                currency=currency,
            )
        tx_payload = attach_agentguard_memo(
            tx_payload,
            agent_id=request.get("agent_id") or agent_did,
            policy_id="default_policy",
            token_id=token.payload["jti"],
            request_hash=request.get("request_hash"),
            purpose=request.get("purpose", ""),
            risk_level="conditional" if decision == "CONDITIONAL_APPROVAL" else None,
        )

        use_real_submit = os.getenv("USE_XRPL_SUBMIT", "false").strip().lower() == "true"
        if os.getenv("PYTEST_CURRENT_TEST"):
            use_real_submit = False

        submit_meta: dict[str, Any] = {"tx_hash": None, "submit_status": "MOCK", "submit_error": None}
        if decision == "CONDITIONAL_APPROVAL":
            submit_meta = {"tx_hash": None, "submit_status": "PENDING_CONFIRMATION", "submit_error": None}
        elif use_real_submit:
            submit_result = submit_xrpl_transaction(tx_payload)
            if submit_result.get("success"):
                submit_meta["tx_hash"] = submit_result.get("tx_hash")
                submit_meta["submit_status"] = "SUBMITTED"
            else:
                submit_meta["submit_status"] = "FAILED"
                submit_meta["submit_error"] = submit_result.get("error")
        elif decision == "APPROVED":
            submit_meta["submit_error"] = "정책상 승인되었지만 현재 MOCK 모드이므로 테스트넷에 제출하지 않았습니다."

        audit_request = dict(request)
        audit_request.update(submit_meta)
        audit_request["decision"] = decision
        audit_request["tx_payload_exists"] = tx_payload_exists
        audit_request["risk_score"] = risk_score
        audit_request["risk_flags"] = risk_flags
        audit_request["policy_id"] = policy_eval.get("policy_id")
        audit_request["policy_version"] = policy_eval.get("policy_version")
        audit_request["policy_source"] = policy_eval.get("policy_source")
        audit_request["applied_limits"] = policy_eval.get("applied_limits")
        audit_request["trustline_check"] = policy_eval.get("trustline_check")
        audit_request["runtime_mode"] = "LIVE" if use_real_submit else "MOCK"
        if token is not None:
            audit_request["token_expires_at"] = int(token.payload.get("exp", 0))
            audit_request["remaining_seconds"] = max(0, int(token.payload.get("exp", 0)) - int(time.time()))
        self.audit_log.append(
            AuditRecord(
                status=decision,
                agent_did=agent_did,
                request=audit_request,
                reason=decision_reason,
                token_id=token.payload["jti"],
                timestamp=time.time(),
            )
        )

        return token

    def _request_execution_legacy(self, agent_did: str, request: dict[str, Any]) -> Optional[ActionToken]:
        request["agent_id"] = request.get("agent_id") or agent_did
        request["wallet_address"] = request.get("wallet_address", "")
        request["destination"] = request.get("destination", request.get("merchant", ""))
        request["merchant"] = request.get("merchant", request["destination"])
        amount = float(request.get("amount", 0))

        if amount > 1000:
            self.audit_log.append(AuditRecord(status="BLOCKED", agent_did=agent_did, request=dict(request), reason="AMOUNT_GUARDRAIL_EXCEEDED", token_id=None, timestamp=time.time()))
            return None
        is_ok, reason = self.policy_engine.check_policy(request)
        if not is_ok:
            self.audit_log.append(AuditRecord(status="BLOCKED", agent_did=agent_did, request=dict(request), reason=reason, token_id=None, timestamp=time.time()))
            return None
        if self.policy_engine.policy.allowed_destinations and request["destination"] not in self.policy_engine.policy.allowed_destinations:
            self.audit_log.append(AuditRecord(status="BLOCKED", agent_did=agent_did, request=dict(request), reason="destination_not_allowed", token_id=None, timestamp=time.time()))
            return None

        risk_score, risk_flags = self.calculate_anomaly_score(request)
        if request.get("context", {}).get("demo_risk_mode") is True:
            risk_score = int(request.get("context", {}).get("simulated_risk_score", risk_score))
            risk_flags = list(request.get("context", {}).get("simulated_flags", risk_flags))
            decision = "APPROVED"
            decision_reason = None
        else:
            if "timestamp" in request:
                hour = time.gmtime(int(request.get("timestamp", time.time()))).tm_hour
                if hour < 6 or hour >= 22:
                    risk_score += 10
                    if "after_hours_execution" not in risk_flags:
                        risk_flags.append("after_hours_execution")
            decision = "REQUIRE_APPROVAL" if risk_score >= 40 else "APPROVED"
            decision_reason = "RISK_SCORE_THRESHOLD" if decision == "REQUIRE_APPROVAL" else None
        if decision == "REQUIRE_APPROVAL":
            self.create_approval_request(request=request, reason=decision_reason or "RISK_SCORE_THRESHOLD", risk_score=risk_score, risk_flags=risk_flags)
            return None

        token = self.token_issuer.issue_token(agent_did, request)
        currency = request.get("currency") or "XRP"
        amount_raw = request.get("amount_raw")
        if currency == "XRP" and amount_raw is not None:
            tx_payload = build_xrp_payment_tx(account=request.get("wallet_address", ""), destination=request.get("destination", ""), amount_drops=amount_raw)
        else:
            tx_payload = _build_payment_tx(account=request.get("wallet_address", ""), destination=request.get("destination", ""), amount=amount, currency=currency)
        tx_payload = attach_agentguard_memo(tx_payload, agent_id=request["agent_id"], policy_id="default_policy", token_id=token.payload["jti"], request_hash=request.get("request_hash"), purpose=request.get("purpose", ""))

        submit_meta: dict[str, Any] = {"tx_hash": None, "submit_status": "MOCK", "submit_error": None}
        if not is_test_or_mock_mode():
            if not os.getenv("XRPL_TESTNET_SEED"):
                submit_meta["submit_status"] = "FAILED"
                submit_meta["submit_error"] = "XRPL_TESTNET_SEED is required"
            else:
                submit_result = submit_xrpl_transaction(tx_payload)
                if submit_result.get("success"):
                    submit_meta["tx_hash"] = submit_result.get("tx_hash")
                    submit_meta["submit_status"] = "SUBMITTED"
                else:
                    submit_meta["submit_status"] = "FAILED"
                    submit_meta["submit_error"] = submit_result.get("error")

        audit_request = dict(request)
        audit_request.update(submit_meta)
        audit_request["risk_score"] = risk_score
        audit_request["risk_flags"] = risk_flags
        audit_request["tx_payload_exists"] = True
        self.audit_log.append(AuditRecord(status="APPROVED", agent_did=agent_did, request=audit_request, reason="policy_ok", token_id=token.payload["jti"], timestamp=time.time()))
        return token

    def consume_token_for_execution(self, token: ActionToken) -> tuple[bool, str]:
        return self.token_issuer.verify_token(token, consume=True)

    def get_audit_anchor(self) -> dict[str, Any]:
        return self.audit_log.anchor_payload(issuer_id="agentguard_gateway_mvp")
