from agentguard.gateway import AgentGuardGateway
from agentguard.policy_loader import load_policy_from_json
from connectors.stripe_connector import StripeConnector


def main():
    policy = load_policy_from_json("policies/saas_payment_policy.json")
    gateway = AgentGuardGateway(policy)
    stripe = StripeConnector(dry_run=True)

    agent_did = "did:xrpl:rEXAMPLE_AGENT_ACCOUNT"

    request = {
        "action": "pay_invoice",
        "amount": 80,
        "merchant": "Stripe",
        "purpose": "SaaS",
    }

    token = gateway.request_execution(agent_did, request)
    if token is None:
        print("Blocked by policy")
        return

    valid, reason = gateway.consume_token_for_execution(token)
    if not valid:
        print("Token rejected:", reason)
        return

    result = stripe.charge(token.payload["action"])

    print("\n--- Stripe Proxy Dry Run ---")
    print(result)

    print("\n--- Audit Anchor ---")
    print(gateway.get_audit_anchor())


if __name__ == "__main__":
    main()
