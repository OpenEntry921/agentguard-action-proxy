from typing import Any, Dict

from agentguard.xrpl_payment import attach_agentguard_memo


def build_agentguard_memo(tx_payload: Dict[str, Any], **kwargs: Any) -> Dict[str, Any]:
    return attach_agentguard_memo(tx_payload, **kwargs)
