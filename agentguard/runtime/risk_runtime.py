from typing import Any, Dict


def extract_risk_fields(policy_result: Dict[str, Any]) -> Dict[str, Any]:
    return {
        'risk_score': policy_result.get('risk_score', 0),
        'risk_flags': policy_result.get('risk_flags', []),
    }
