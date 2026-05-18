from agentguard.gateway import AgentGuardGateway
from agentguard.policy_loader import load_policy_from_json


def main():
    policy = load_policy_from_json("policies/travel_spending_policy.json")

    gateway = AgentGuardGateway(policy)
    agent_did = "did:openentry:agent:travel:001"

    print("\n--- 정상 요청 테스트 ---")
    request_ok = {
        "action": "book_hotel",
        "amount": 250,
        "merchant": "HotelExpress",
        "purpose": "Business Trip",
    }
    token = gateway.request_execution(agent_did, request_ok)
    print("Token issued:", token.payload if token else None)

    if token:
        print("Execution proxy consume:", gateway.consume_token_for_execution(token))
        print("Replay attempt:", gateway.consume_token_for_execution(token))

    print("\n--- 정책 위반 테스트: 한도 초과 ---")
    request_blocked = {
        "action": "book_hotel",
        "amount": 500,
        "merchant": "HotelExpress",
        "purpose": "Business Trip",
    }
    token2 = gateway.request_execution(agent_did, request_blocked)
    print("Token issued:", token2)

    print("\n--- Audit Anchor Payload ---")
    print(gateway.get_audit_anchor())


if __name__ == "__main__":
    main()
