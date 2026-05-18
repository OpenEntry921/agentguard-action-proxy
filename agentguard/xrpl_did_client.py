import os
from typing import Any, Optional

from .xrpl_utils import canonical_json_text, str_to_hex


class XRPLDIDClient:
    """XRPL DID client.

    Supports:
    1. Build-only mode: returns DIDSet transaction payload.
    2. Submit mode: if xrpl-py and XRPL_SEED are available, submits to testnet/devnet/mainnet.
    """

    NETWORK_URLS = {
        "testnet": "https://s.altnet.rippletest.net:51234/",
        "devnet": "https://s.devnet.rippletest.net:51234/",
        "mainnet": "https://s1.ripple.com:51234/",
    }

    def __init__(self, network: str = "testnet", json_rpc_url: Optional[str] = None):
        self.network = network
        self.json_rpc_url = json_rpc_url or self.NETWORK_URLS.get(network, network)

    def build_didset_payload(
        self,
        account: str,
        did_document_uri: Optional[str] = None,
        did_document: Optional[dict] = None,
        data: Optional[dict] = None,
    ) -> dict:
        if not did_document_uri and not did_document and not data:
            raise ValueError("DIDSet requires at least one of URI, DIDDocument, or Data")

        payload = {"TransactionType": "DIDSet", "Account": account}

        if did_document_uri:
            payload["URI"] = str_to_hex(did_document_uri)
        if did_document:
            payload["DIDDocument"] = str_to_hex(canonical_json_text(did_document))
        if data:
            payload["Data"] = str_to_hex(canonical_json_text(data))

        return payload

    def build_agent_did_document(
        self,
        xrpl_account: str,
        service_endpoint: str = "https://gateway.agentguard.local",
        controller: Optional[str] = None,
    ) -> dict:
        did = "did:xrpl:%s" % xrpl_account
        return {
            "@context": [
                "https://www.w3.org/ns/did/v1",
                "https://w3id.org/security/suites/ed25519-2020/v1",
            ],
            "id": did,
            "controller": controller or did,
            "verificationMethod": [
                {
                    "id": did + "#key-1",
                    "type": "Ed25519VerificationKey2020",
                    "controller": did,
                    "publicKeyMultibase": "zReplaceWithResolvedXRPLAccountKey",
                }
            ],
            "authentication": [did + "#key-1"],
            "assertionMethod": [did + "#key-1"],
            "service": [
                {
                    "id": did + "#agentguard-gateway",
                    "type": "AgentGuardActionGateway",
                    "serviceEndpoint": service_endpoint,
                }
            ],
        }

    def submit_didset(self, wallet_seed: str, payload: dict) -> dict:
        try:
            from xrpl.clients import JsonRpcClient
            from xrpl.wallet import Wallet
            from xrpl.transaction import submit_and_wait
            from xrpl.models.transactions import DIDSet
        except Exception as exc:
            raise RuntimeError("xrpl-py is required for live submit: pip install xrpl-py") from exc

        client = JsonRpcClient(self.json_rpc_url)
        wallet = Wallet.from_seed(wallet_seed)

        tx = DIDSet(
            account=payload["Account"],
            uri=payload.get("URI"),
            did_document=payload.get("DIDDocument"),
            data=payload.get("Data"),
        )

        response = submit_and_wait(tx, client, wallet)
        return response.result

    def submit_didset_from_env(self, payload: dict) -> dict:
        seed = os.getenv("XRPL_SEED")
        if not seed:
            return {
                "submitted": False,
                "reason": "XRPL_SEED not set. Returning dry-run payload only.",
                "payload": payload,
            }
        return {"submitted": True, "result": self.submit_didset(seed, payload)}
