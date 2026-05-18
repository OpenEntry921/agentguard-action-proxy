from xrpl.wallet import Wallet

from agentguard.api import _build_payment_tx
from examples.api_client_demo import build_preview_payload


def test_demo_payload_uses_xrp_when_real_submit_enabled():
    import os
    os.environ["XRPL_TESTNET_SEED"] = Wallet.create().seed
    payload = build_preview_payload(True, "rDestX")
    assert payload["currency"] == "XRP"


def test_build_payment_tx_uses_string_amount_for_xrp():
    tx_payload = _build_payment_tx(
        account="rWallet",
        destination="rDest",
        amount=1,
        currency="XRP",
    )
    assert tx_payload["TransactionType"] == "Payment"
    assert tx_payload["Amount"] == "1000000"
    assert isinstance(tx_payload["Amount"], str)


def test_live_submit_demo_does_not_use_rlusd_dict_amount():
    import os
    os.environ["XRPL_TESTNET_SEED"] = Wallet.create().seed
    payload = build_preview_payload(True, "rDestX")
    assert payload["currency"] == "XRP"

    tx_payload = _build_payment_tx(
        account="rWallet",
        destination=payload["destination"],
        amount=float(payload["amount"]) / 1_000_000,
        currency=payload["currency"],
    )
    assert isinstance(tx_payload["Amount"], str)
    assert not isinstance(tx_payload["Amount"], dict)
