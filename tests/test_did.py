from agentguard.crypto import IdentityManager
from agentguard.did import AgentDIDFactory, PolicyCredentialIssuer
from agentguard.did_registry import InMemoryDIDRegistry


def test_agent_did_creation_and_registry():
    did, doc, private_key, public_key = AgentDIDFactory.create_agent_did(
        namespace="test",
        controller_did="did:agentguard:org:test",
    )

    assert did.startswith("did:agentguard:test:")
    assert doc.id == did

    registry = InMemoryDIDRegistry()
    registry.register(doc)

    resolved = registry.resolve(did)
    assert resolved["id"] == did
    assert resolved["controller"] == "did:agentguard:org:test"


def test_policy_credential_issued_to_agent_did():
    issuer_private_key, issuer_public_key = IdentityManager.generate_key_pair()
    issuer = PolicyCredentialIssuer(
        issuer_did="did:agentguard:org:test",
        issuer_private_key=issuer_private_key,
    )

    credential = issuer.issue_policy_credential(
        subject_agent_did="did:agentguard:agent:001",
        policy_ref="policies/test.json",
        claims={"max_amount": 100},
    )

    assert credential["credential"]["subject"] == "did:agentguard:agent:001"
    assert credential["credential"]["claims"]["max_amount"] == 100
    assert "proof" in credential
