from decimal import Decimal
from typing import Callable, NamedTuple

from app.schema import OrderRequest

MAX_TRADE_USD = Decimal("10000.00")


class RuleResult(NamedTuple):
    passed: bool
    reason: str


# ---------------------------------------------------------------------------
# Individual rule functions
# ---------------------------------------------------------------------------

def _check_max_trade_size(order: OrderRequest, balance_cents: int) -> RuleResult:
    """No single trade may exceed $10,000 in notional value."""
    if order.trade_value > MAX_TRADE_USD:
        return RuleResult(
            passed=False,
            reason=(
                f"Trade value ${order.trade_value:,.2f} exceeds "
                f"max allowed ${MAX_TRADE_USD:,.2f}"
            ),
        )
    return RuleResult(passed=True, reason="")


def _check_solvency(order: OrderRequest, balance_cents: int) -> RuleResult:
    """
    Bid (buy) orders must not exceed the user's USD balance.
    Ask (sell) orders: share inventory check is done in app.py against
    the in-memory orderbook user balances.
    """
    if order.side != "bid":
        return RuleResult(passed=True, reason="")

    required_cents = int(order.trade_value * 100)
    if required_cents > balance_cents:
        balance_usd = balance_cents / 100
        return RuleResult(
            passed=False,
            reason=(
                f"Insufficient funds: need ${order.trade_value:,.2f}, "
                f"have ${balance_usd:,.2f}"
            ),
        )
    return RuleResult(passed=True, reason="")


# ---------------------------------------------------------------------------
# Rule registry — extend here only
# ---------------------------------------------------------------------------

RuleFunc = Callable[[OrderRequest, int], RuleResult]

RULES: list[RuleFunc] = [
    _check_max_trade_size,
    _check_solvency,
]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def run_risk_checks(order: OrderRequest, balance_cents: int) -> RuleResult:
    """
    Run every rule in order.  Return the first failure, or success if all pass.
    Short-circuits on first failure so the reason is always specific.
    """
    for rule in RULES:
        result = rule(order, balance_cents)
        if not result.passed:
            return result
    return RuleResult(passed=True, reason="")