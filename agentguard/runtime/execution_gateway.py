import os
from typing import Any, Dict, Optional

from agentguard.audit.receipt_builder import AuditReceiptBuilder
from agentguard.runtime.transient_token_engine import TransientActionTokenEngine
from agentguard.security.replay_protection import ReplayProtection
from agentguard.xrpl_payment import submit_xrpl_transaction


class RuntimeMode:
    LIVE = "LIVE"
    MOCK = "MOCK"
    TEST = "TEST"


class ExecutionGateway:
    def __init__(self, token_engine: Optional[TransientActionTokenEngine] = None, replay: Optional[ReplayProtection] = None) -> None:
        self.token_engine = token_engine or TransientActionTokenEngine()
        self.replay = replay or ReplayProtection()
        self.receipt_builder = AuditReceiptBuilder()

    def runtime_mode(self) -> str:
        if os.getenv("PYTEST_CURRENT_TEST"):
            return RuntimeMode.TEST
        if os.getenv("USE_XRPL_SUBMIT", "false").lower() == "true":
            return RuntimeMode.LIVE
        return RuntimeMode.MOCK

    def execute(self, token_id: str, tx_payload: Dict[str, Any]) -> Dict[str, Any]:
        validated = self.token_engine.validate_token(token_id)
        if not validated.get("valid"):
            return {"decision": "BLOCKED", "reason": validated.get("reason"), "runtime_mode": self.runtime_mode()}
        token = validated["token"]
        nonce = str(token.get("nonce"))
        if self.replay.nonce_exists(nonce):
            return {"decision": "BLOCKED", "reason": "duplicate_nonce", "runtime_mode": self.runtime_mode()}
        if self.replay.token_already_used(token_id):
            return {"decision": "BLOCKED", "reason": "replay_attack_detected", "runtime_mode": self.runtime_mode()}

        self.replay.register_nonce(nonce)
        self.replay.register_token_usage(token_id)
        self.token_engine.invalidate_token(token_id)

        submit_meta = {"tx_hash": None, "submit_status": "MOCK", "submit_error": None}
        if self.runtime_mode() == RuntimeMode.LIVE:
            result = submit_xrpl_transaction(tx_payload)
            submit_meta = {
                "tx_hash": result.get("tx_hash"),
                "submit_status": "SUBMITTED" if result.get("success") else "FAILED",
                "submit_error": result.get("error"),
            }

        receipt = self.receipt_builder.build_receipt(
            decision_id=str(token.get("decision_id")),
            request_hash=str(token.get("request_hash", "")),
            policy_hash=str(token.get("policy_hash", "")),
            did=str(token.get("did", "")),
            destination=str(token.get("destination", "")),
            amount_drops=int(token.get("amount_drops", 0)),
            risk_flags=[],
            final_decision="APPROVED",
            xrpl_tx_hash=submit_meta.get("tx_hash"),
            xrpl_lookup_mode=self.runtime_mode(),
        )
        return {"decision": "APPROVED", "runtime_mode": self.runtime_mode(), "receipt": receipt, **submit_meta}
