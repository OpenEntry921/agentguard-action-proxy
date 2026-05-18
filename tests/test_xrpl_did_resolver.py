import pytest

from agentguard.did_adapter import DIDAdapter
from agentguard.xrpl_did_resolver import XRPLDIDResolver


def test_xrpl_did_resolver_stub():
    resolver = XRPLDIDResolver(network="testnet")
    adapter = DIDAdapter(resolver)

    identity = adapter.get_agent_identity("did:xrpl:rEXAMPLE")

    assert identity["did"] == "did:xrpl:rEXAMPLE"
    assert identity["controller"] == "rEXAMPLE"
    assert identity["source"] == "xrpl_stub"


def test_xrpl_did_resolver_rejects_non_xrpl_did():
    resolver = XRPLDIDResolver(network="testnet")

    with pytest.raises(ValueError):
        resolver.resolve("did:agentguard:agent:001")
