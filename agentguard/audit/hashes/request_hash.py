import hashlib
from typing import Any, Dict

from agentguard.crypto import canonical_json


def build_request_hash(request: Dict[str, Any]) -> str:
    return hashlib.sha256(canonical_json(request)).hexdigest()
