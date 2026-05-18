from typing import Any, Dict


def build_decision_result(policy_result: Dict[str, Any]) -> Dict[str, Any]:
    return {
        'decision': policy_result.get('decision'),
        'reason': policy_result.get('reason'),
        'risk_score': policy_result.get('risk_score', 0),
        'risk_flags': policy_result.get('risk_flags', []),
        'policy_id': policy_result.get('policy_id'),
        'policy_version': policy_result.get('policy_version'),
        'policy_source': policy_result.get('policy_source'),
        'applied_limits': policy_result.get('applied_limits'),
        'trustline_check': policy_result.get('trustline_check'),
    }
