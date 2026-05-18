from agentguard.gateway import AgentGuardGateway
from agentguard.policy_loader import load_policy_from_json
from anchors.xrpl_anchor_stub import XRPLAnchorStub


def main():
    policy = load_policy_from_json("policies/travel_spending_policy.json")
    gateway = AgentGuardGateway(policy)

    gateway.request_execution(
        "did:openentry:agent:travel:001",
        {
            "action": "book_hotel",
            "amount": 250,
            "merchant": "HotelExpress",
            "purpose": "Business Trip",
        },
    )

    anchor = gateway.get_audit_anchor()

    xrpl_stub = XRPLAnchorStub(account="rEXAMPLE_XRPL_ACCOUNT")
    payload = xrpl_stub.build_anchor_payload(anchor)

    print("XRPL anchor explanation:")
    print(xrpl_stub.explain())

    print("\nPrepared XRPL Memo payload:")
    print(payload)


if __name__ == "__main__":
    main()
