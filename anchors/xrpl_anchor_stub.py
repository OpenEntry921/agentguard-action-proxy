import json
from dataclasses import dataclass
from typing import Any


@dataclass
class XRPLAnchorPayload:
    account: str
    transaction_type: str
    memo_type: str
    memo_data: str


class XRPLAnchorStub:
    """XRPL anchor stub.

    This does not submit to XRPL.
    It prepares the payload that would be placed in a transaction Memo.

    Production version:
    - Use xrpl-py or xrpl.js
    - Submit a Payment or AccountSet transaction with Memo
    - Store audit Merkle Root in MemoData
    - Keep raw logs off-chain
    """

    def __init__(self, account: str):
        self.account = account

    def build_anchor_payload(self, audit_anchor: dict[str, Any]) -> XRPLAnchorPayload:
        memo = {
            "protocol": "agentguard",
            "version": "0.1",
            "anchor": audit_anchor,
        }
        memo_data = json.dumps(memo, sort_keys=True, separators=(",", ":"))

        return XRPLAnchorPayload(
            account=self.account,
            transaction_type="AccountSet_or_Payment",
            memo_type="agentguard_audit_anchor",
            memo_data=memo_data,
        )

    def explain(self) -> str:
        return (
            "Only the Merkle Root and metadata should be anchored on XRPL. "
            "Raw logs must remain off-chain for privacy, cost, and scalability."
        )
