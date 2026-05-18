from agentguard.xrpl_did_client import XRPLDIDClient


def main():
    client = XRPLDIDClient(network="testnet")
    account = "rEXAMPLE_AGENT_ACCOUNT"

    did_doc = client.build_agent_did_document(
        xrpl_account=account,
        service_endpoint="https://gateway.agentguard.local",
    )

    payload = client.build_didset_payload(
        account=account,
        did_document=did_doc,
        data={
            "project": "AgentGuard",
            "role": "AI Agent DID trust anchor",
        },
    )

    print("\n--- DIDSet Payload Dry Run ---")
    print(payload)

    print("\n--- Optional Submit From Env ---")
    print("Set XRPL_SEED to submit this to XRPL testnet.")
    print(client.submit_didset_from_env(payload))


if __name__ == "__main__":
    main()
