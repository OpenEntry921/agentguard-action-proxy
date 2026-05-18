from agentguard.challenge import ChallengeService
from agentguard.crypto import IdentityManager
from agentguard.did import AgentDIDFactory
from agentguard.vc import PolicyVCIssuer, ActionPresentationBuilder, PresentationVerifier


def test_policy_vc_and_presentation_challenge_domain():
    org_private, _ = IdentityManager.generate_key_pair()
    org_did = "did:agentguard:org:test"

    agent_did, doc, agent_private, _ = AgentDIDFactory.create_agent_did(
        namespace="test",
        controller_did=org_did,
    )

    issuer = PolicyVCIssuer(org_did, org_private)
    vc = issuer.issue_policy_vc(
        agent_did,
        "policies/test.json",
        {"max_amount": 100, "allowed_actions": ["pay_invoice"]},
    )

    challenge = ChallengeService(
        verifier_did="did:agentguard:gateway:test",
        domain="gateway.test",
    ).generate()

    vp = ActionPresentationBuilder(agent_did, agent_private).create_presentation(
        credentials=[vc],
        challenge=challenge.challenge,
        domain=challenge.domain,
    )

    verifier = PresentationVerifier(expected_domain="gateway.test")
    assert verifier.verify_presentation_envelope(vp) == (True, "presentation_envelope_ok")

    # replay should fail
    assert verifier.verify_presentation_envelope(vp) == (False, "challenge_replay_detected")
