import os
import time
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Union

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from xrpl.wallet import Wallet
import yaml

from agentguard.gateway import AgentGuardGateway
from agentguard.policy import Policy
from agentguard.ui.demo.demo_page import get_demo_html
from agentguard.explainability import build_execution_explanation
from agentguard.audit.append_only_log import append_audit_receipt
from agentguard.audit.hash_utils import compute_audit_receipt_hash, compute_request_hash
from agentguard.audit.receipt_builder import build_audit_receipt
from agentguard.xrpl.payment.payment_builder import build_payment_tx
from agentguard.xrpl_payment import submit_xrpl_transaction


class ExecutionRequest(BaseModel):
    agent_id: str
    action: str
    amount: Union[int, float, str]
    currency: Optional[str] = None
    destination: str
    purpose: str
    signer_seed: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class ExecutionConfirmRequest(BaseModel):
    transient_token_id: str
    confirm: bool
    signer_seed: Optional[str] = None



def _build_hard_block_response(
    reason: str,
    *,
    include_submit_error: bool = False,
    extra_fields: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    response: Dict[str, Any] = {
        "decision": "BLOCKED",
        "reason": reason,
        "risk_score": 100,
        "risk_flags": [reason],
        "submit_status": "BLOCKED",
        "tx_hash": None,
        "execution_explanation": build_execution_explanation("BLOCKED", [reason], reason),
    }
    if include_submit_error:
        response["submit_error"] = None
    if extra_fields:
        response.update(extra_fields)
    return response


def _attach_audit_evidence(response: Dict[str, Any], receipt: Dict[str, Any]) -> Dict[str, Any]:
    response["audit_receipt"] = receipt
    response["audit_receipt_hash"] = compute_audit_receipt_hash(receipt)
    append_audit_receipt({"audit_receipt": receipt, "audit_receipt_hash": response["audit_receipt_hash"]})
    return response

def _default_currency(gateway: AgentGuardGateway) -> str:
    runtime_policy = getattr(gateway, "runtime_policy_engine", None)
    if runtime_policy is not None:
        currency = str(runtime_policy.policy.get("xrpl", {}).get("currency", "")).strip()
        if currency:
            return currency
    return "XRP"

def _build_payment_tx(account: str, destination: str, amount: float, currency: str) -> Dict[str, Any]:
    return build_payment_tx(account=account, destination=destination, amount=amount, currency=currency)


def create_default_gateway() -> AgentGuardGateway:
    allowed_destinations = {
        "rnAo7npmjoMhAuYZtnGGjAffsJJPxs3sHk",
        "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe",
        "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
    }
    testnet_destination = os.getenv("XRPL_TESTNET_DESTINATION")
    if testnet_destination:
        allowed_destinations.add(testnet_destination)

    policy = Policy(
        max_amount=1000,
        allowed_destinations=allowed_destinations,
        allowed_actions={"pay"},
        allowed_purposes={"ops", "vendor_payment", "treasury"},
        daily_limit=5000,
    )
    return AgentGuardGateway(policy)


def create_runtime_gateway() -> AgentGuardGateway:
    """데모 런타임 전용 게이트웨이: 정책 판단은 policy.yaml 기반 경로만 사용."""
    return AgentGuardGateway(Policy(max_amount=float("inf")))


def create_app(gateway: Optional[AgentGuardGateway] = None) -> FastAPI:
    app = FastAPI(title="AgentGuard 정책 기반 실행 통제 데모")
    gateway = gateway or create_runtime_gateway()
    app.state.gateway = gateway
    app.state.pending_confirmations = {}

    def load_did_bindings() -> Dict[str, Any]:
        with open("configs/did_binding.yaml", "r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}

    def derive_signer_account(signer_seed: Optional[str]) -> str:
        if not signer_seed:
            raise ValueError("invalid_signer_seed")
        try:
            return Wallet.from_seed(signer_seed).classic_address
        except Exception:
            raise ValueError("invalid_signer_seed")



    def submit_xrpl_payment_with_signer_seed(
        *,
        signer_seed: Optional[str],
        signer_account: str,
        destination: str,
        amount_drops: int,
        currency: str,
        memo_context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        seed = signer_seed or os.getenv("XRPL_TESTNET_SEED")
        if not seed:
            return {"success": False, "error": "missing_signer_seed"}
        try:
            wallet = Wallet.from_seed(seed)
        except Exception:
            return {"success": False, "error": "invalid_signer_seed"}
        if wallet.classic_address != signer_account:
            return {"success": False, "error": "signer_account_mismatch"}
        if not destination or not destination.startswith("r"):
            return {"success": False, "error": "invalid_destination"}
        if amount_drops <= 0:
            return {"success": False, "error": "invalid_amount"}

        amount_for_tx = float(amount_drops)
        if currency == "XRP":
            amount_for_tx = amount_for_tx / 1_000_000
        tx_payload = _build_payment_tx(signer_account, destination, amount_for_tx, currency)
        if memo_context:
            tx_payload["Memos"] = memo_context.get("Memos", tx_payload.get("Memos", []))
        return submit_xrpl_transaction(tx_payload, signer_seed=seed)

    def get_did_binding_policy() -> Dict[str, Any]:
        return load_did_bindings().get("did_binding_policy", {})

    def get_allowed_accounts_for_did(agent_id: str) -> list[str]:
        did_bindings = load_did_bindings().get("did_bindings", {})
        return did_bindings.get(agent_id, {}).get("allowed_accounts", [])

    def ensure_signer_bound_to_did(agent_id: str, signer_account: str) -> tuple[bool, list[str], bool]:
        allowed = get_allowed_accounts_for_did(agent_id)
        strict_binding_required = bool(get_did_binding_policy().get("strict_binding_required", False))
        return signer_account in allowed, allowed, strict_binding_required

    @app.get("/health")
    def health() -> Dict[str, str]:
        return {"status": "ok"}

    @app.get("/demo", response_class=HTMLResponse)
    def demo_page() -> str:
        return get_demo_html()


    @app.post("/execution/preview")
    def execution_preview(req: ExecutionRequest) -> Dict[str, Any]:
        if not req.destination or not req.destination.startswith("r"):
            return _build_hard_block_response("invalid_destination")
        if not req.signer_seed or not req.signer_seed.startswith("s"):
            return _build_hard_block_response("invalid_signer_seed")
        try:
            amount_int = int(req.amount)
            if amount_int <= 0 or float(req.amount) != amount_int:
                raise ValueError
        except (TypeError, ValueError):
            return {"decision": "BLOCKED", "reason": "amount는 정수 drops 기준이어야 합니다."}
        try:
            signer_account = derive_signer_account(req.signer_seed)
            did_binding_check, allowed_accounts, strict_binding_required = ensure_signer_bound_to_did(req.agent_id, signer_account)
        except ValueError as exc:
            return _build_hard_block_response(str(exc))
        if strict_binding_required and not did_binding_check:
            return _build_hard_block_response(
                "signer_not_bound_to_did",
                extra_fields={
                    "signer_account": signer_account,
                    "agent_id": req.agent_id,
                    "did_binding_check": False,
                    "allowed_accounts": allowed_accounts,
                    "strict_binding_required": strict_binding_required,
                    "policy_source": "configs/did_binding.yaml",
                },
            )
        request = {
            "agent_id": req.agent_id,
            "wallet_address": signer_account,
            "action": req.action,
            "amount": amount_int,
            "currency": req.currency or _default_currency(gateway),
            "destination": req.destination,
            "purpose": req.purpose,
            "context": req.context or {},
            "merchant": req.destination,
        }
        request["request_hash"] = request.get("request_hash")
        token = gateway.request_execution(req.agent_id, request)
        latest = gateway.audit_log.records[-1]
        result = {
            "decision": latest.status,
            "reason": latest.reason,
            "request_hash": latest.request.get("request_hash"),
            "decision_id": latest.request.get("decision_id"),
            "policy_hash": latest.request.get("policy_hash"),
            "runtime_mode": latest.request.get("runtime_mode", latest.request.get("xrpl_lookup_mode", "MOCK")),
            "transient_token_id": token.payload["jti"] if token else None,
            "token_expires_at": latest.request.get("token_expires_at"),
            "replay_protection": latest.request.get("replay_protection", {"nonce_valid": True, "token_unused": True}),
            "risk_score": latest.request.get("risk_score", 0),
            "risk_flags": latest.request.get("risk_flags", []),
            "execution_explanation": latest.request.get("execution_explanation"),
            "policy_id": latest.request.get("policy_id"),
            "policy_version": latest.request.get("policy_version"),
            "policy_source": latest.request.get("policy_source"),
            "applied_limits": latest.request.get("applied_limits"),
            "trustline_check": latest.request.get("trustline_check"),
            "xrpl_checks": latest.request.get("xrpl_checks"),
            "xrpl_lookup_mode": latest.request.get("xrpl_lookup_mode", "MOCK"),
            "signer_account": signer_account,
            "derived_from_did": req.agent_id,
            "did_binding_check": did_binding_check,
            "allowed_accounts": allowed_accounts,
            "strict_binding_required": strict_binding_required,
        }
        if latest.status in {"CONDITIONAL_APPROVAL", "REQUIRE_APPROVAL"}:
            approval_id = None
            for k, v in gateway.approval_requests.items():
                if v.get("request_hash") == latest.request.get("request_hash"):
                    approval_id = k
                    break
            result["approval_id"] = approval_id
        if token is not None:
            # preview는 토큰을 소모하지 않기 위해 즉시 롤백
            if token.payload["jti"] in gateway.token_issuer.issued_jti:
                gateway.token_issuer.issued_jti.remove(token.payload["jti"])
        return result

    @app.post("/execution/request")
    def execution_request(req: ExecutionRequest) -> Dict[str, Any]:
        created_at = datetime.now(timezone.utc).isoformat()
        if not req.destination or not req.destination.startswith("r"):
            blocked = _build_hard_block_response("invalid_destination", include_submit_error=True)
            receipt = build_audit_receipt(decision_id=None, request_hash=None, policy_id=None, policy_version=None, policy_hash=None, agent_id=req.agent_id, signer_account=None, action=req.action, purpose=req.purpose, destination=req.destination, amount_drops=None, currency=req.currency, decision="BLOCKED", risk_score=100, risk_flags=["invalid_destination"], reason="invalid_destination", submit_status="BLOCKED", tx_hash=None, runtime_mode="UNKNOWN", xrpl_lookup_mode="UNKNOWN", created_at=created_at)
            return _attach_audit_evidence(blocked, receipt)
        if not req.signer_seed or not req.signer_seed.startswith("s"):
            blocked = _build_hard_block_response("invalid_signer_seed", include_submit_error=True)
            receipt = build_audit_receipt(decision_id=None, request_hash=None, policy_id=None, policy_version=None, policy_hash=None, agent_id=req.agent_id, signer_account=None, action=req.action, purpose=req.purpose, destination=req.destination, amount_drops=None, currency=req.currency, decision="BLOCKED", risk_score=100, risk_flags=["invalid_signer_seed"], reason="invalid_signer_seed", submit_status="BLOCKED", tx_hash=None, runtime_mode="UNKNOWN", xrpl_lookup_mode="UNKNOWN", created_at=created_at)
            return _attach_audit_evidence(blocked, receipt)
        try:
            amount_int = int(req.amount)
            if amount_int <= 0 or float(req.amount) != amount_int:
                raise ValueError
        except (TypeError, ValueError):
            return {"decision": "BLOCKED", "reason": "amount는 정수 drops 기준이어야 합니다.", "submit_error": None}
        try:
            signer_account = derive_signer_account(req.signer_seed)
            did_binding_check, allowed_accounts, strict_binding_required = ensure_signer_bound_to_did(req.agent_id, signer_account)
        except ValueError as exc:
            return _build_hard_block_response(str(exc), include_submit_error=True)
        if strict_binding_required and not did_binding_check:
            return _build_hard_block_response(
                "signer_not_bound_to_did",
                include_submit_error=True,
                extra_fields={
                    "signer_account": signer_account,
                    "agent_id": req.agent_id,
                    "did_binding_check": False,
                    "allowed_accounts": allowed_accounts,
                    "strict_binding_required": strict_binding_required,
                    "policy_source": "configs/did_binding.yaml",
                },
            )
        request = {
            "agent_id": req.agent_id,
            "wallet_address": signer_account,
            "action": req.action,
            "amount": amount_int,
            "currency": req.currency or _default_currency(gateway),
            "destination": req.destination,
            "purpose": req.purpose,
            "context": req.context or {},
            "merchant": req.destination,
        }
        request_hash = compute_request_hash(request)
        request["request_hash"] = request_hash
        token = gateway.request_execution(req.agent_id, request)
        latest = gateway.audit_log.records[-1]
        response = {
            "decision": latest.status,
            "reason": latest.reason,
            "request_hash": latest.request.get("request_hash"),
            "decision_id": latest.request.get("decision_id"),
            "policy_hash": latest.request.get("policy_hash"),
            "runtime_mode": latest.request.get("runtime_mode", latest.request.get("xrpl_lookup_mode", "MOCK")),
            "transient_token_id": token.payload["jti"] if token else None,
            "token_expires_at": latest.request.get("token_expires_at"),
            "remaining_seconds": latest.request.get("remaining_seconds"),
            "replay_protection": latest.request.get("replay_protection", {"nonce_valid": True, "token_unused": True}),
            "token_id": token.payload["jti"] if token else None,
            "tx_payload": None,
            "approval_id": None,
            "risk_score": latest.request.get("risk_score", 0),
            "risk_flags": latest.request.get("risk_flags", []),
            "execution_explanation": latest.request.get("execution_explanation"),
            "submit_status": latest.request.get("submit_status", "MOCK"),
            "submit_error": latest.request.get("submit_error"),
            "tx_hash": latest.request.get("tx_hash"),
            "signer_account": signer_account,
            "derived_from_did": req.agent_id,
            "did_binding_check": did_binding_check,
            "allowed_accounts": allowed_accounts,
            "strict_binding_required": strict_binding_required,
            "tx_hash_reason": None,
            "policy_id": latest.request.get("policy_id"),
            "policy_version": latest.request.get("policy_version"),
            "policy_source": latest.request.get("policy_source"),
            "applied_limits": latest.request.get("applied_limits"),
            "trustline_check": latest.request.get("trustline_check"),
            "xrpl_checks": latest.request.get("xrpl_checks"),
            "xrpl_lookup_mode": latest.request.get("xrpl_lookup_mode", "MOCK"),
        }
        if token:
            amount_for_tx = float(amount_int)
            currency = req.currency or _default_currency(gateway)
            if currency == "XRP":
                amount_for_tx = amount_for_tx / 1_000_000
            response["tx_payload"] = _build_payment_tx(signer_account, req.destination, amount_for_tx, currency)
            response["signer_account"] = signer_account
            if latest.status == "APPROVED":
                runtime_mode = str(response.get("runtime_mode", "MOCK")).upper()
                force_submit = os.getenv("USE_XRPL_SUBMIT", "false").lower() == "true"
                use_real_submit = force_submit or runtime_mode == "LIVE"
                if (os.getenv("PYTEST_CURRENT_TEST") and not force_submit) or runtime_mode == "TEST":
                    use_real_submit = False

                if use_real_submit:
                    submit_result = submit_xrpl_payment_with_signer_seed(
                        signer_seed=req.signer_seed,
                        signer_account=signer_account,
                        destination=req.destination,
                        amount_drops=amount_int,
                        currency=currency,
                        memo_context=response.get("tx_payload") if isinstance(response.get("tx_payload"), dict) else None,
                    )
                    if submit_result.get("success"):
                        response["submit_status"] = "SUBMITTED"
                        response["submit_error"] = None
                        response["tx_hash"] = submit_result.get("tx_hash")
                    else:
                        response["submit_status"] = "FAILED"
                        response["submit_error"] = submit_result.get("error")
                        response["tx_hash"] = None
                        response["tx_hash_reason"] = "정책은 승인되었지만 XRPL 제출에 실패했습니다."
                else:
                    response["submit_status"] = "MOCK"
                    response["submit_error"] = None
                    response["tx_hash"] = None
            elif latest.status == "CONDITIONAL_APPROVAL":
                response["submit_status"] = "PENDING_CONFIRMATION"
                response["tx_hash"] = None
                response["tx_hash_reason"] = "사용자 Confirm Execution 이전에는 제출하지 않습니다."
                expires_at = latest.request.get("token_expires_at")
                app.state.pending_confirmations[token.payload["jti"]] = {
                    "request": request,
                    "signer_account": signer_account,
                    "consumed": False,
                    "expires_at": expires_at,
                    "decision_id": latest.request.get("decision_id"),
                    "policy_hash": latest.request.get("policy_hash"),
                    "request_hash": latest.request.get("request_hash"),
                    "runtime_mode": latest.request.get("runtime_mode", latest.request.get("xrpl_lookup_mode", "MOCK")),
                }
            elif response.get("submit_status") == "MOCK":
                response["tx_hash_reason"] = "시뮬레이션이라 TX Hash 없음"
            elif response.get("submit_status") == "BLOCKED":
                response["tx_hash_reason"] = "차단 결정은 제출되지 않습니다."
            elif response.get("submit_status") != "SUBMITTED" and response.get("tx_hash") is None:
                response["tx_hash_reason"] = response.get("submit_error") or "제출되지 않았습니다."
        elif latest.status == "BLOCKED":
            response["submit_status"] = "BLOCKED"
            response["tx_hash_reason"] = "차단 결정은 제출되지 않습니다."
        elif latest.status in {"CONDITIONAL_APPROVAL", "REQUIRE_APPROVAL"}:
            for k, v in gateway.approval_requests.items():
                if v.get("request_hash") == latest.request.get("request_hash") and v.get("status") == "PENDING":
                    response["approval_id"] = k
                    break
        receipt = build_audit_receipt(
            decision_id=response.get("decision_id"),
            request_hash=response.get("request_hash"),
            policy_id=response.get("policy_id"),
            policy_version=response.get("policy_version"),
            policy_hash=response.get("policy_hash"),
            agent_id=req.agent_id,
            signer_account=response.get("signer_account"),
            action=req.action,
            purpose=req.purpose,
            destination=req.destination,
            amount_drops=amount_int,
            currency=req.currency or _default_currency(gateway),
            decision=response.get("decision"),
            risk_score=response.get("risk_score"),
            risk_flags=response.get("risk_flags"),
            reason=response.get("reason"),
            submit_status=response.get("submit_status"),
            tx_hash=response.get("tx_hash"),
            runtime_mode=response.get("runtime_mode"),
            xrpl_lookup_mode=response.get("xrpl_lookup_mode"),
            created_at=created_at,
            confirmed_by=None,
            confirmed_at=None,
        )
        return _attach_audit_evidence(response, receipt)

    @app.post("/execution/confirm")
    def execution_confirm(req: ExecutionConfirmRequest) -> Dict[str, Any]:
        pending = app.state.pending_confirmations.get(req.transient_token_id)
        if not pending:
            return {"decision": "CONDITIONAL_APPROVAL", "submit_status": "REJECTED", "reason": "invalid_or_expired_token", "tx_hash": None, "execution_explanation": build_execution_explanation("CONDITIONAL_APPROVAL", [], "invalid_or_expired_token") }
        if pending.get("consumed"):
            return {"decision": "CONDITIONAL_APPROVAL", "submit_status": "REJECTED", "reason": "replay_attack_detected", "tx_hash": None, "execution_explanation": build_execution_explanation("CONDITIONAL_APPROVAL", [], "replay_attack_detected") }
        expires_at = pending.get("expires_at")
        if expires_at is not None:
            expires_ts = int(expires_at)
            if int(time.time()) >= expires_ts:
                pending["consumed"] = True
                return {"decision": "CONDITIONAL_APPROVAL", "submit_status": "REJECTED", "reason": "expired_token", "tx_hash": None, "execution_explanation": build_execution_explanation("CONDITIONAL_APPROVAL", [], "expired_token") }
        pending["consumed"] = True
        if req.confirm is not True:
            response = {
                "decision": "CONDITIONAL_APPROVAL",
                "submit_status": "USER_REJECTED",
                "tx_hash": None,
                "transient_token_id": req.transient_token_id,
                "runtime_mode": pending.get("runtime_mode", "MOCK"),
                "signer_account": pending.get("signer_account"),
                "derived_from_did": pending.get("request", {}).get("agent_id"),
                "execution_explanation": build_execution_explanation("CONDITIONAL_APPROVAL", ["destination_not_whitelisted"], None),
            }
            receipt = build_audit_receipt(decision_id=pending.get("decision_id"), request_hash=pending.get("request_hash"), policy_id=None, policy_version=None, policy_hash=pending.get("policy_hash"), agent_id=pending.get("request", {}).get("agent_id"), signer_account=pending.get("signer_account"), action=pending.get("request", {}).get("action"), purpose=pending.get("request", {}).get("purpose"), destination=pending.get("request", {}).get("destination"), amount_drops=pending.get("request", {}).get("amount"), currency=pending.get("request", {}).get("currency"), decision="CONDITIONAL_APPROVAL", risk_score=None, risk_flags=["destination_not_whitelisted"], reason=None, submit_status="USER_REJECTED", tx_hash=None, runtime_mode=pending.get("runtime_mode", "MOCK"), xrpl_lookup_mode=pending.get("runtime_mode", "MOCK"), confirmed_by="web_user", rejected_at=datetime.now(timezone.utc).isoformat())
            return _attach_audit_evidence(response, receipt)

        tx_payload = _build_payment_tx(
            pending.get("signer_account"),
            pending["request"]["destination"],
            float(pending["request"]["amount"]) / 1_000_000,
            pending["request"].get("currency") or _default_currency(gateway),
        )
        use_real_submit = os.getenv("USE_XRPL_SUBMIT", "false").strip().lower() == "true"
        if not use_real_submit:
            return {
                "decision": "CONDITIONAL_APPROVAL",
                "submit_status": "MOCK",
                "tx_hash": None,
                "tx_hash_reason": "시뮬레이션이라 TX Hash 없음",
                "reason": "정책상 승인되었지만 현재 MOCK 모드이므로 테스트넷에 제출하지 않았습니다.",
                "transient_token_id": req.transient_token_id,
                "runtime_mode": pending.get("runtime_mode", "MOCK"),
                "signer_account": pending.get("signer_account"),
                "derived_from_did": pending.get("request", {}).get("agent_id"),
                "execution_explanation": build_execution_explanation("CONDITIONAL_APPROVAL", ["destination_not_whitelisted"], None),
            }

        submit_result = submit_xrpl_payment_with_signer_seed(
            signer_seed=req.signer_seed,
            signer_account=pending.get("signer_account"),
            destination=pending["request"]["destination"],
            amount_drops=int(pending["request"]["amount"]),
            currency=pending["request"].get("currency") or _default_currency(gateway),
            memo_context=tx_payload,
        )
        if submit_result.get("success"):
            response = {
                "decision": "CONDITIONAL_APPROVAL",
                "submit_status": "SUBMITTED",
                "tx_hash": submit_result.get("tx_hash"),
                "tx_hash_reason": None,
                "transient_token_id": req.transient_token_id,
                "runtime_mode": pending.get("runtime_mode", "MOCK"),
                "signer_account": pending.get("signer_account"),
                "replay_protection": {"token_unused": True, "token_consumed": True},
                "decision_id": pending.get("decision_id"),
                "policy_hash": pending.get("policy_hash"),
                "request_hash": pending.get("request_hash"),
                "derived_from_did": pending.get("request", {}).get("agent_id"),
                "execution_explanation": build_execution_explanation("CONDITIONAL_APPROVAL", ["destination_not_whitelisted"], None),
            }
            receipt = build_audit_receipt(decision_id=pending.get("decision_id"), request_hash=pending.get("request_hash"), policy_id=None, policy_version=None, policy_hash=pending.get("policy_hash"), agent_id=pending.get("request", {}).get("agent_id"), signer_account=pending.get("signer_account"), action=pending.get("request", {}).get("action"), purpose=pending.get("request", {}).get("purpose"), destination=pending.get("request", {}).get("destination"), amount_drops=pending.get("request", {}).get("amount"), currency=pending.get("request", {}).get("currency"), decision="CONDITIONAL_APPROVAL", risk_score=None, risk_flags=["destination_not_whitelisted"], reason=None, submit_status="SUBMITTED", tx_hash=submit_result.get("tx_hash"), runtime_mode=pending.get("runtime_mode", "MOCK"), xrpl_lookup_mode=pending.get("runtime_mode", "MOCK"), confirmed_by="web_user", confirmed_at=datetime.now(timezone.utc).isoformat())
            return _attach_audit_evidence(response, receipt)
        return {
            "decision": "CONDITIONAL_APPROVAL",
            "submit_status": "FAILED",
            "tx_hash": None,
            "tx_hash_reason": submit_result.get("error") or "제출 실패",
            "reason": submit_result.get("error"),
            "transient_token_id": req.transient_token_id,
            "runtime_mode": pending.get("runtime_mode", "MOCK"),
            "signer_account": pending.get("signer_account"),
            "derived_from_did": pending.get("request", {}).get("agent_id"),
        }

    @app.post("/approval/{approval_id}/approve")
    def approve(approval_id: str) -> Dict[str, Any]:
        result = gateway.approve_request(approval_id)
        if not result.get("approved"):
            return {"decision": "REJECTED", "token_id": None, "tx_payload": None, "reason": result.get("reason")}
        token = result.get("token")
        return {
            "decision": "APPROVED",
            "approval_id": approval_id,
            "token_id": token.payload["jti"] if token else None,
            "tx_payload": result.get("tx_payload"),
            "submit_status": result.get("submit_status"),
            "submit_error": result.get("submit_error"),
            "tx_hash": result.get("tx_hash"),
        }

    @app.post("/approval/{approval_id}/reject")
    def reject(approval_id: str) -> Dict[str, Any]:
        result = gateway.reject_request(approval_id)
        return {
            "decision": result.get("decision", "REJECTED"),
            "approval_id": approval_id,
            "token_id": None,
        }

    @app.get("/audit/anchor")
    def audit_anchor() -> Dict[str, Any]:
        return gateway.get_audit_anchor()

    return app


app = create_app()
