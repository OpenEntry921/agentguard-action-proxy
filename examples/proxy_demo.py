from agentguard.gateway import AgentGuardGateway
from agentguard.policy_loader import load_policy_from_json
from agentguard.proxy import ExecutionProxy, MockExternalAPI


def main():
    policy = load_policy_from_json("policies/saas_payment_policy.json")

    gateway = AgentGuardGateway(policy)
    external_api = MockExternalAPI(api_key="sk_live_example_real_key_hidden_from_agent")
    proxy = ExecutionProxy(gateway, external_api)

    agent_did = "did:openentry:agent:saas:001"

    request = {
        "action": "pay_invoice",
        "amount": 80,
        "merchant": "Stripe",
        "purpose": "SaaS",
    }

    token = gateway.request_execution(agent_did, request)
    if token is None:
        print("Request blocked")
        return

    print("Agent received action token only.")
    print("Token jti:", token.payload["jti"])

    result = proxy.execute_payment(token)
    print("Proxy result:", result)

    replay_result = proxy.execute_payment(token)
    print("Replay result:", replay_result)

    print("Audit anchor:", gateway.get_audit_anchor())


if __name__ == "__main__":
    main()
