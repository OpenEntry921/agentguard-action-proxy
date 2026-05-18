from agentguard.xrpl_did_client import XRPLDIDClient
from anchors.xrpl_anchor_client import XRPLAuditAnchorClient


def test_build_didset_payload():
    client = XRPLDIDClient(network="testnet")
    doc = client.build_agent_did_document("rTEST")
    payload = client.build_didset_payload("rTEST", did_document=doc)

    assert payload["TransactionType"] == "DIDSet"
    assert payload["Account"] == "rTEST"
    assert "DIDDocument" in payload


def test_build_anchor_payment_payload():
    client = XRPLAuditAnchorClient(network="testnet")
    payload = client.build_payment_anchor_payload(
        account="rSOURCE",
        destination="rDEST",
        audit_anchor={
            "type": "agentguard_audit_anchor",
            "record_count": 1,
            "merkle_root": "abc",
            "created_at": 1,
        },
    )

    assert payload["TransactionType"] == "Payment"
    assert payload["Memos"][0]["Memo"]["MemoType"]
