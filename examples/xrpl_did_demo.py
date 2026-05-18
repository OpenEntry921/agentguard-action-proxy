from agentguard.did_adapter import DIDAdapter
from agentguard.xrpl_did_resolver import XRPLDIDResolver


def main():
    resolver = XRPLDIDResolver(network="testnet")
    adapter = DIDAdapter(resolver)

    agent_did = "did:xrpl:rEXAMPLE_AGENT_ACCOUNT"

    identity = adapter.get_agent_identity(agent_did)

    print("\n--- XRPL DID Resolution Stub ---")
    print(identity)

    print("\nMeaning:")
    print("XRPL DID identifies who the agent is.")
    print("AgentGuard policies decide what the agent can do.")


if __name__ == "__main__":
    main()
