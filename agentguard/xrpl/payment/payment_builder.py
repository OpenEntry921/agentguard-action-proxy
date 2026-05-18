from typing import Any, Dict

from agentguard.xrpl_payment import build_rlusd_payment_tx, build_xrp_payment_tx


def build_payment_tx(account: str, destination: str, amount: float, currency: str) -> Dict[str, Any]:
    if currency == 'XRP':
        amount_drops = str(int(round(float(amount) * 1_000_000)))
        return build_xrp_payment_tx(account=account, destination=destination, amount_drops=amount_drops)
    return build_rlusd_payment_tx(account=account, destination=destination, amount=float(amount), currency=currency)
