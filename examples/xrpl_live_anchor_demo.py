import os

from agentguard.gateway import AgentGuardGateway
from agentguard.policy_loader import load_policy_from_json
from anchors.xrpl_anchor_client import XRPLAuditAnchorClient


def main():
    policy = load_policy_from_json("policies/travel_spending_policy.json")
    gateway = AgentGuardGateway(policy)

    gateway.request_execution(
        "did:xrpl:rEXAMPLE_AGENT_ACCOUNT",
        {
            "action": "book_hotel",
            "amount": 250,
            "merchant": "HotelExpress",
            "purpose": "Business Trip",
        },
    )

    audit_anchor = gateway.get_audit_anchor()
    client = XRPLAuditAnchorClient(network="testnet")

    source_account = os.getenv("XRPL_ACCOUNT", "rEXAMPLE_SOURCE_ACCOUNT")
    destination = os.getenv("XRPL_ANCHOR_DESTINATION", source_account)

    payload = client.build_payment_anchor_payload(
        account=source_account,
        destination=destination,
        audit_anchor=audit_anchor,
        amount_drops="1",
    )

    print("\n--- XRPL Audit Anchor Payment Payload ---")
    print(payload)

    print("\n--- Optional Submit From Env ---")
    print("Set XRPL_SEED and XRPL_ACCOUNT to submit this to XRPL testnet.")
    print(client.submit_anchor_from_env(payload))


if __name__ == "__main__":
    main()
