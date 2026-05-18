import hashlib
import time
from dataclasses import dataclass, asdict
from typing import Any
from typing import Optional

from .crypto import canonical_json


@dataclass
class AuditRecord:
    status: str
    agent_did: str
    request: dict[str, Any]
    reason: Optional[str]
    token_id: Optional[str]
    timestamp: float
    record_hash: Optional[str] = None


class MerkleAuditLog:
    """Layer 3: Verifiable Action Log.

    Stores raw records off-chain and produces a Merkle root for anchoring.
    """

    def __init__(self):
        self.records: list[AuditRecord] = []

    def append(self, record: AuditRecord) -> str:
        record.record_hash = self.record_hash(record)
        self.records.append(record)
        return record.record_hash

    @staticmethod
    def record_hash(record: AuditRecord) -> str:
        payload = asdict(record)
        payload.pop("record_hash", None)
        return hashlib.sha256(canonical_json(payload)).hexdigest()

    def leaf_hashes(self) -> list[bytes]:
        return [bytes.fromhex(r.record_hash or self.record_hash(r)) for r in self.records]

    def merkle_root(self) -> str:
        leaves = self.leaf_hashes()
        if not leaves:
            return hashlib.sha256(b"").hexdigest()

        level = leaves
        while len(level) > 1:
            if len(level) % 2 == 1:
                level.append(level[-1])
            next_level = []
            for i in range(0, len(level), 2):
                next_level.append(hashlib.sha256(level[i] + level[i + 1]).digest())
            level = next_level

        return level[0].hex()

    def anchor_payload(self, issuer_id: Optional[str] = None) -> dict[str, Any]:
        latest_record_hash = self.records[-1].record_hash if self.records else None
        return {
            "type": "agentguard_audit_anchor",
            "record_count": len(self.records),
            "merkle_root": self.merkle_root(),
            "generated_at": int(time.time()),
            "issuer_id": issuer_id or "agentguard_gateway_mvp",
            "latest_record_hash": latest_record_hash,
        }

    def generate_merkle_proof(self, record_hash: str) -> list[dict[str, str]]:
        leaf_hashes_hex = [r.record_hash or self.record_hash(r) for r in self.records]
        if record_hash not in leaf_hashes_hex:
            raise ValueError("RECORD_HASH_NOT_FOUND")

        index = leaf_hashes_hex.index(record_hash)
        level = [bytes.fromhex(h) for h in leaf_hashes_hex]
        proof: list[dict[str, str]] = []

        while len(level) > 1:
            if len(level) % 2 == 1:
                level.append(level[-1])

            sibling_index = index + 1 if index % 2 == 0 else index - 1
            direction = "right" if index % 2 == 0 else "left"
            proof.append({"direction": direction, "hash": level[sibling_index].hex()})

            next_level = []
            for i in range(0, len(level), 2):
                next_level.append(hashlib.sha256(level[i] + level[i + 1]).digest())
            level = next_level
            index //= 2

        return proof

    @staticmethod
    def verify_merkle_proof(record_hash: str, proof: list[dict[str, str]], merkle_root: str) -> bool:
        current = bytes.fromhex(record_hash)
        for item in proof:
            sibling = bytes.fromhex(item["hash"])
            if item["direction"] == "right":
                current = hashlib.sha256(current + sibling).digest()
            elif item["direction"] == "left":
                current = hashlib.sha256(sibling + current).digest()
            else:
                return False
        return current.hex() == merkle_root

    def get_audit_record_by_hash(self, record_hash: str) -> Optional[AuditRecord]:
        for record in self.records:
            if (record.record_hash or self.record_hash(record)) == record_hash:
                return record
        return None

    def get_audit_records_by_request_hash(self, request_hash: str) -> list[AuditRecord]:
        return [r for r in self.records if r.request.get("request_hash") == request_hash]

    def get_audit_records_by_approval_id(self, approval_id: str) -> list[AuditRecord]:
        return [r for r in self.records if r.request.get("approval_id") == approval_id]
