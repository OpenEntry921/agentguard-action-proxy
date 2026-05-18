from dataclasses import dataclass
from typing import Any


@dataclass
class StripePaymentResult:
    ok: bool
    provider: str
    amount: float
    merchant: str
    message: str
    raw: dict


class StripeConnector:
    """Stripe connector interface.

    This MVP uses dry-run mode by default.
    Production should use Stripe SDK and keep STRIPE_SECRET_KEY inside the proxy.
    """

    def __init__(self, dry_run: bool = True):
        self.dry_run = dry_run

    def charge(self, request: dict) -> StripePaymentResult:
        amount = float(request.get("amount", 0))
        merchant = request.get("merchant", "Stripe")
        purpose = request.get("purpose", "unknown")

        if self.dry_run:
            return StripePaymentResult(
                ok=True,
                provider="stripe_mock",
                amount=amount,
                merchant=merchant,
                message="dry-run payment approved by proxy",
                raw={
                    "dry_run": True,
                    "purpose": purpose,
                    "note": "No real Stripe API call was made.",
                },
            )

        raise NotImplementedError("Live Stripe integration intentionally not enabled in MVP.")
