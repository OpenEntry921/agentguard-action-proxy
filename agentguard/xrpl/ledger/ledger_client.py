import os
from typing import Any, Dict

import json
from urllib import request


class LedgerClient:
    def account_info(self, account: str) -> Dict[str, Any]:
        raise NotImplementedError

    def account_lines(self, account: str) -> Dict[str, Any]:
        raise NotImplementedError

    def account_tx(self, account: str, limit: int = 50) -> Dict[str, Any]:
        raise NotImplementedError


class XrplLedgerClient(LedgerClient):
    def __init__(self, node_url: str) -> None:
        self.node_url = node_url

    def _post(self, method: str, params: Dict[str, Any]) -> Dict[str, Any]:
        payload = {"method": method, "params": [params]}
        data = json.dumps(payload).encode("utf-8")
        req = request.Request(self.node_url, data=data, headers={"Content-Type": "application/json"})
        with request.urlopen(req, timeout=5) as resp:
            return json.loads(resp.read().decode("utf-8"))

    def account_info(self, account: str) -> Dict[str, Any]:
        return self._post("account_info", {"account": account, "ledger_index": "validated", "strict": True})

    def account_lines(self, account: str) -> Dict[str, Any]:
        return self._post("account_lines", {"account": account, "ledger_index": "validated"})

    def account_tx(self, account: str, limit: int = 50) -> Dict[str, Any]:
        return self._post("account_tx", {"account": account, "ledger_index_min": -1, "ledger_index_max": -1, "limit": limit})


class MockLedgerClient(LedgerClient):
    def __init__(self) -> None:
        self._account_info = {}
        self._account_lines = {}
        self._account_tx = {}

    def set_account_info(self, account: str, value: Dict[str, Any]) -> None:
        self._account_info[account] = value

    def set_account_lines(self, account: str, value: Dict[str, Any]) -> None:
        self._account_lines[account] = value

    def set_account_tx(self, account: str, value: Dict[str, Any]) -> None:
        self._account_tx[account] = value

    def account_info(self, account: str) -> Dict[str, Any]:
        return self._account_info.get(account, {"result": {"status": "error", "error": "actNotFound"}})

    def account_lines(self, account: str) -> Dict[str, Any]:
        return self._account_lines.get(account, {"result": {"status": "success", "lines": []}})

    def account_tx(self, account: str, limit: int = 50) -> Dict[str, Any]:
        return self._account_tx.get(account, {"result": {"status": "success", "transactions": []}})


def get_ledger_client(policy: Dict[str, Any]) -> LedgerClient:
    use_live = is_live_lookup_enabled()
    if use_live:
        node_url = str(policy.get("xrpl", {}).get("node_url", "https://s.altnet.rippletest.net:51234"))
        return XrplLedgerClient(node_url)
    return MockLedgerClient()


def is_live_lookup_enabled() -> bool:
    if os.getenv("PYTEST_CURRENT_TEST"):
        return False
    return os.getenv("USE_XRPL_LIVE_LOOKUP", "false").strip().lower() == "true"
