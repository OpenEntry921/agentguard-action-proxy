import sys
import types

from agentguard.xrpl_payment import submit_xrpl_transaction


class _FakeWallet:
    classic_address = "rFAKEADDR"

    @classmethod
    def from_seed(cls, seed):
        if seed != "sFAKESEED":
            raise ValueError("invalid seed")
        return cls()


class _FakePayment:
    def __init__(self, **kwargs):
        self.kwargs = kwargs


class _FakeMemo:
    def __init__(self, memo_type=None, memo_format=None, memo_data=None):
        self.memo_type = memo_type
        self.memo_format = memo_format
        self.memo_data = memo_data


class _FakeIssuedCurrencyAmount:
    def __init__(self, currency=None, issuer=None, value=None):
        self.currency = currency
        self.issuer = issuer
        self.value = value


class _FakeResponse:
    def __init__(self):
        self.result = {"hash": "ABC123", "validated": True}


def _install_fake_xrpl(monkeypatch, captured):
    clients_mod = types.ModuleType("xrpl.clients")
    models_mod = types.ModuleType("xrpl.models")
    transactions_mod = types.ModuleType("xrpl.models.transactions")
    amounts_mod = types.ModuleType("xrpl.models.amounts")
    wallet_mod = types.ModuleType("xrpl.wallet")
    transaction_mod = types.ModuleType("xrpl.transaction")

    def _fake_submit_and_wait(payment, client, wallet):
        captured["payment_kwargs"] = payment.kwargs
        captured["wallet_address"] = wallet.classic_address
        return _FakeResponse()

    class _FakeJsonRpcClient:
        def __init__(self, endpoint):
            self.endpoint = endpoint

    clients_mod.JsonRpcClient = _FakeJsonRpcClient
    transactions_mod.Payment = _FakePayment
    transactions_mod.Memo = _FakeMemo
    amounts_mod.IssuedCurrencyAmount = _FakeIssuedCurrencyAmount
    wallet_mod.Wallet = _FakeWallet
    transaction_mod.submit_and_wait = _fake_submit_and_wait

    monkeypatch.setitem(sys.modules, "xrpl.clients", clients_mod)
    monkeypatch.setitem(sys.modules, "xrpl.models", models_mod)
    monkeypatch.setitem(sys.modules, "xrpl.models.transactions", transactions_mod)
    monkeypatch.setitem(sys.modules, "xrpl.models.amounts", amounts_mod)
    monkeypatch.setitem(sys.modules, "xrpl.wallet", wallet_mod)
    monkeypatch.setitem(sys.modules, "xrpl.transaction", transaction_mod)


def test_submit_xrpl_transaction_maps_raw_payload_for_payment(monkeypatch):
    captured = {}
    _install_fake_xrpl(monkeypatch, captured)

    tx_payload = {
        "TransactionType": "Payment",
                "Destination": "rDEST",
        "Amount": {"currency": "RLUSD", "issuer": "rISSUER", "value": "1"},
        "Memos": [{"Memo": {"MemoData": "ABCD"}}],
    }

    monkeypatch.setenv("XRPL_TESTNET_SEED", "sFAKESEED")
    result = submit_xrpl_transaction(tx_payload)

    assert result["success"] is True
    assert result["tx_hash"] == "ABC123"
    assert captured["wallet_address"] == "rFAKEADDR"
    assert captured["payment_kwargs"]["account"] == "rFAKEADDR"
    assert captured["payment_kwargs"]["destination"] == "rDEST"
    assert captured["payment_kwargs"]["amount"].value == "1"
    assert captured["payment_kwargs"]["amount"].currency == "RLUSD"
    assert captured["payment_kwargs"]["memos"][0].memo_data == "ABCD"
    assert "TransactionType" not in captured["payment_kwargs"]


def test_submit_xrpl_transaction_mock_mode_unchanged():
    tx_payload = {
        "TransactionType": "Payment",
                "Destination": "rDEST",
        "Amount": {"currency": "RLUSD", "issuer": "rISSUER", "value": "1"},
    }

    assert tx_payload["TransactionType"] == "Payment"
    assert tx_payload["Destination"] == "rDEST"


def test_submit_xrpl_transaction_keeps_native_xrp_amount_string(monkeypatch):
    captured = {}
    _install_fake_xrpl(monkeypatch, captured)

    tx_payload = {
        "TransactionType": "Payment",
                "Destination": "rDEST",
        "Amount": "1000000",
    }

    monkeypatch.setenv("XRPL_TESTNET_SEED", "sFAKESEED")
    result = submit_xrpl_transaction(tx_payload)

    assert result["success"] is True
    assert captured["payment_kwargs"]["amount"] == "1000000"


def test_submit_xrpl_transaction_invalid_seed_fails(monkeypatch):
    captured = {}
    _install_fake_xrpl(monkeypatch, captured)
    monkeypatch.setenv("XRPL_TESTNET_SEED", "bad")
    result = submit_xrpl_transaction({"Account": "rFAKEADDR", "Destination": "rDEST", "Amount": "1000000"})
    assert result["success"] is False


def test_submit_xrpl_transaction_signer_mismatch_fails(monkeypatch):
    captured = {}
    _install_fake_xrpl(monkeypatch, captured)
    monkeypatch.setenv("XRPL_TESTNET_SEED", "sFAKESEED")
    result = submit_xrpl_transaction({"Account": "rOTHER", "Destination": "rDEST", "Amount": "1000000"})
    assert result["success"] is False
    assert result["error"] == "signer_account_mismatch"
