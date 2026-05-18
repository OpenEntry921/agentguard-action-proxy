from dataclasses import asdict
from typing import Any, Optional

from .did import DIDDocument


class InMemoryDIDRegistry:
    """Minimal DID registry for MVP.

    Production options:
    - Database-backed registry
    - DID documents anchored on-chain
    - DID document hash anchored to XRPL
    """

    def __init__(self):
        self._documents: dict[str, dict[str, Any]] = {}

    def register(self, did_document: DIDDocument) -> None:
        self._documents[did_document.id] = asdict(did_document)

    def resolve(self, did: str) -> Optional[dict[str, Any]]:
        return self._documents.get(did)

    def list_dids(self) -> list[str]:
        return list(self._documents.keys())
