from agentguard.crypto import IdentityManager
from agentguard.did import AgentDIDFactory, PolicyCredentialIssuer
from agentguard.did_registry import InMemoryDIDRegistry
from agentguard.gateway import AgentGuardGateway
from agentguard.policy_loader import load_policy_from_json


def main():
    # Organization / user controller DID
    org_private_key, org_public_key = IdentityManager.generate_key_pair()
    org_did = "did:agentguard:org:openentry"

    # 1. Create AI Agent DID
    agent_did, did_doc, agent_private_key, agent_public_key = AgentDIDFactory.create_agent_did(
        namespace="travel",
        controller_did=org_did,
    )

    # 2. Register DID document
    registry = InMemoryDIDRegistry()
    registry.register(did_doc)

    print("\n--- Agent DID Created ---")
    print("Agent DID:", agent_did)
    print("DID Document:", registry.resolve(agent_did))

    # 3. Issue policy-bound credential to Agent DID
    issuer = PolicyCredentialIssuer(issuer_did=org_did, issuer_private_key=org_private_key)
    policy_vc = issuer.issue_policy_credential(
        subject_agent_did=agent_did,
        policy_ref="policies/travel_spending_policy.json",
        claims={
            "max_amount": 300,
            "allowed_merchants": ["HotelExpress", "AirFlight"],
            "allowed_actions": ["book_hotel", "book_flight"],
        },
        ttl_seconds=3600,
    )

    print("\n--- Policy Credential Issued ---")
    print(policy_vc)

    # 4. Use Agent DID as execution subject
    policy = load_policy_from_json("policies/travel_spending_policy.json")
    gateway = AgentGuardGateway(policy)

    request = {
        "action": "book_hotel",
        "amount": 250,
        "merchant": "HotelExpress",
        "purpose": "Business Trip",
    }

    token = gateway.request_execution(agent_did, request)

    print("\n--- Action Token ---")
    print(token)

    print("\n--- Audit Anchor ---")
    print(gateway.get_audit_anchor())


if __name__ == "__main__":
    main()
