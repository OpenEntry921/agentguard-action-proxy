from dataclasses import asdict

from agentguard.challenge import ChallengeService
from agentguard.crypto import IdentityManager
from agentguard.did import AgentDIDFactory
from agentguard.did_registry import InMemoryDIDRegistry
from agentguard.gateway import AgentGuardGateway
from agentguard.policy_loader import load_policy_from_json
from agentguard.vc import PolicyVCIssuer, ActionPresentationBuilder, PresentationVerifier


def main():
    # Legacy mapping:
    # Issuer  -> Organization / Policy Issuer
    # Holder  -> AI Agent DID
    # Verifier -> Execution Gateway

    organization_private_key, _ = IdentityManager.generate_key_pair()
    organization_did = "did:agentguard:org:openentry"

    gateway_verifier_did = "did:agentguard:gateway:spending"
    gateway_domain = "spending.agentguard.local"

    # 1. Create AI Agent DID
    agent_did, did_doc, agent_private_key, _ = AgentDIDFactory.create_agent_did(
        namespace="spending",
        controller_did=organization_did,
        service_endpoint="https://spending.agentguard.local/gateway",
    )

    registry = InMemoryDIDRegistry()
    registry.register(did_doc)

    print("\n[1] AI Agent DID")
    print(agent_did)
    print(registry.resolve(agent_did))

    # 2. Organization issues Policy VC to Agent DID
    vc_issuer = PolicyVCIssuer(
        issuer_did=organization_did,
        issuer_private_key=organization_private_key,
    )

    policy_vc = vc_issuer.issue_policy_vc(
        agent_did=agent_did,
        policy_ref="policies/travel_spending_policy.json",
        claims={
            "max_amount": 300,
            "allowed_merchants": ["HotelExpress", "AirFlight"],
            "allowed_actions": ["book_hotel", "book_flight"],
            "allowed_purposes": ["Business Trip", "Flight"],
            "delegated_by": "did:agentguard:user:employee-001",
        },
        ttl_seconds=3600,
    )

    print("\n[2] Policy VC issued to Agent DID")
    print(policy_vc)

    # 3. Gateway generates domain-bound challenge
    challenge_service = ChallengeService(
        verifier_did=gateway_verifier_did,
        domain=gateway_domain,
    )
    challenge = challenge_service.generate()

    print("\n[3] Gateway Challenge")
    print(asdict(challenge))

    # 4. Agent creates VP for gateway
    vp_builder = ActionPresentationBuilder(
        holder_agent_did=agent_did,
        holder_private_key=agent_private_key,
    )
    vp = vp_builder.create_presentation(
        credentials=[policy_vc],
        challenge=challenge.challenge,
        domain=challenge.domain,
    )

    print("\n[4] Agent Action Presentation")
    print(vp)

    # 5. Gateway verifies VP envelope
    verifier = PresentationVerifier(expected_domain=gateway_domain)
    ok, reason = verifier.verify_presentation_envelope(vp)

    print("\n[5] Gateway VP verification")
    print(ok, reason)

    # 6. If presentation is accepted, normal AgentGuard flow continues
    policy = load_policy_from_json("policies/travel_spending_policy.json")
    gateway = AgentGuardGateway(policy)

    request = {
        "action": "book_hotel",
        "amount": 250,
        "merchant": "HotelExpress",
        "purpose": "Business Trip",
    }

    token = gateway.request_execution(agent_did, request)
    print("\n[6] Action Token")
    print(token)

    print("\n[7] Audit Anchor")
    print(gateway.get_audit_anchor())


if __name__ == "__main__":
    main()
