import os
from typing import Any, Optional

from agentguard.xrpl_utils import canonical_json_text, str_to_hex


class XRPLAuditAnchorClient:
    """Anchors AgentGuard audit Merkle Root to XRPL.

    Safe default: build transaction payload only.
    Live submit requires XRPL_SEED and xrpl-py.
    """

    NETWORK_URLS = {
        "testnet": "https://s.altnet.rippletest.net:51234/",
        "devnet": "https://s.devnet.rippletest.net:51234/",
        "mainnet": "https://s1.ripple.com:51234/",
    }

    def __init__(self, network: str = "testnet", json_rpc_url: Optional[str] = None):
        self.network = network
        self.json_rpc_url = json_rpc_url or self.NETWORK_URLS.get(network, network)

    def build_anchor_memo(self, audit_anchor: dict) -> dict:
        memo = {
            "protocol": "agentguard",
            "version": "0.2",
            "type": "audit_anchor",
            "anchor": audit_anchor,
        }
        return {
            "Memo": {
                "MemoType": str_to_hex("agentguard/audit-anchor"),
                "MemoFormat": str_to_hex("application/json"),
                "MemoData": str_to_hex(canonical_json_text(memo)),
            }
        }

    def build_payment_anchor_payload(
        self,
        account: str,
        destination: str,
        audit_anchor: dict,
        amount_drops: str = "1",
    ) -> dict:
        return {
            "TransactionType": "Payment",
            "Account": account,
            "Destination": destination,
            "Amount": amount_drops,
            "Memos": [self.build_anchor_memo(audit_anchor)],
        }

    def submit_anchor_payment(self, wallet_seed: str, payload: dict) -> dict:
        try:
            from xrpl.clients import JsonRpcClient
            from xrpl.wallet import Wallet
            from xrpl.transaction import submit_and_wait
            from xrpl.models.transactions import Payment, Memo
        except Exception as exc:
            raise RuntimeError("xrpl-py is required for live submit: pip install xrpl-py") from exc

        client = JsonRpcClient(self.json_rpc_url)
        wallet = Wallet.from_seed(wallet_seed)

        memos = []
        for m in payload.get("Memos", []):
            memo = m["Memo"]
            memos.append(
                Memo(
                    memo_type=memo.get("MemoType"),
                    memo_format=memo.get("MemoFormat"),
                    memo_data=memo.get("MemoData"),
                )
            )

        tx = Payment(
            account=payload["Account"],
            destination=payload["Destination"],
            amount=payload["Amount"],
            memos=memos,
        )

        response = submit_and_wait(tx, client, wallet)
        return response.result

    def submit_anchor_from_env(self, payload: dict) -> dict:
        seed = os.getenv("XRPL_SEED")
        if not seed:
            return {
                "submitted": False,
                "reason": "XRPL_SEED not set. Returning dry-run payload only.",
                "payload": payload,
            }
        return {"submitted": True, "result": self.submit_anchor_payment(seed, payload)}
