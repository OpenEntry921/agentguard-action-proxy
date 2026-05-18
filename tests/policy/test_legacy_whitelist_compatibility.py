import logging

from agentguard.policy.parser.config_loader import _apply_deprecated_trustline_whitelist


def test_trustline_whitelist_deprecated_warning_logged(caplog):
    policy = {"trustline_whitelist": {"allowed_destinations": ["rDest1"]}}
    with caplog.at_level(logging.WARNING):
        updated = _apply_deprecated_trustline_whitelist(policy)
    assert "trustline_whitelist is deprecated" in caplog.text
    assert "rDest1" in updated["legacy_whitelist"]["allowed_destinations"]


def test_legacy_whitelist_fallback_remains_compatible():
    policy = {"trustline_whitelist": {"allowed_destinations": ["rDest1"]}}
    updated = _apply_deprecated_trustline_whitelist(policy)
    assert updated["legacy_whitelist"]["enabled"] is True
    assert updated["legacy_whitelist"]["allowed_destinations"] == ["rDest1"]
