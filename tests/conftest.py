import pytest


def pytest_collection_modifyitems(config, items):
    skip_legacy_xrpl = pytest.mark.skip(reason="Legacy XRPL-specific tests are temporarily isolated for generic Action Proxy demos.")
    for item in items:
        path = str(item.fspath)
        if "/tests/xrpl/" in path or path.endswith("test_xrp_mode.py") or "test_xrpl" in path or "gateway_xrpl_mvp" in path:
            item.add_marker(skip_legacy_xrpl)
