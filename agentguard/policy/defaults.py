from copy import deepcopy

DEFAULT_TRUSTLINE_POLICY = {
    "mode": "xrpl_lookup",
    "require_trustline": False,
    "block_if_no_trustline": False,
    "allowed_currencies": ["XRP"],
    "allowed_issuers": [],
    "require_authorized_trustline": False,
    "allow_xrp_without_trustline": True,
}

DEFAULT_DESTINATION_POLICY = {
    "require_account_exists": True,
    "allow_new_destination": True,
    "new_destination_risk_score": 20,
    "block_if_account_not_found": True,
}

DEFAULT_HISTORY_POLICY = {
    "enable_account_tx_lookup": False,
    "detect_new_destination": True,
}


def default_policy_sections():
    return {
        "trustline_policy": deepcopy(DEFAULT_TRUSTLINE_POLICY),
        "destination_policy": deepcopy(DEFAULT_DESTINATION_POLICY),
        "history_policy": deepcopy(DEFAULT_HISTORY_POLICY),
    }
