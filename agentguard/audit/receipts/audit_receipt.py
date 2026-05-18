from typing import Any, Dict, List, Optional


def build_audit_receipt(tx_hash: Optional[str], request_hash: Optional[str], policy_id: Optional[str], policy_version: Optional[str], decision: Optional[str], risk_flags: Optional[List[str]], timestamp: int) -> Dict[str, Any]:
    return {
        'tx_hash': tx_hash,
        'request_hash': request_hash,
        'policy_id': policy_id,
        'policy_version': policy_version,
        'decision': decision,
        'risk_flags': risk_flags or [],
        'timestamp': timestamp,
    }
