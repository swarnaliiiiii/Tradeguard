from __future__ import annotations

import threading
from dataclasses import dataclass, field
from decimal import Decimal
from typing import Optional

from app.schema import OrderRequest

MAX_ORDERS_IN_MEMORY = 100  # per side


# ---------------------------------------------------------------------------
# Internal data structures
# ---------------------------------------------------------------------------

@dataclass
class _BookOrder:
    user_id: str
    price_cents: int        # integer cents
    quantity: int           # integer shares


@dataclass
class _UserAccount:
    usd_cents: int          # cash balance in cents
    shares: int             # share count for the single ticker


# ---------------------------------------------------------------------------
# Module-level state  (single-instance pattern — one book per process)
# ---------------------------------------------------------------------------

_lock = threading.Lock()
_bids: list[_BookOrder] = []   # sorted high → low
_asks: list[_BookOrder] = []   # sorted low  → high
_users: dict[str, _UserAccount] = {}


# ---------------------------------------------------------------------------
# Public helpers
# ---------------------------------------------------------------------------

def seed_user(user_id: str, usd_cents: int, shares: int = 10) -> None:
    """Idempotent: only seeds if user does not already exist."""
    with _lock:
        if user_id not in _users:
            _users[user_id] = _UserAccount(usd_cents=usd_cents, shares=shares)


def get_user_balances(user_id: str) -> Optional[dict]:
    with _lock:
        acc = _users.get(user_id)
        if acc is None:
            return None
        return {"usd": acc.usd_cents / 100, "shares": acc.shares}


def get_depth() -> dict:
    """
    Return aggregated depth dict:
      { price_str: { "type": "bid"|"ask", "quantity": int } }
    Prices formatted as "$X.XX" strings so JSON keys are unambiguous.
    """
    with _lock:
        depth: dict[str, dict] = {}

        for order in _bids:
            key = str(order.price_cents)
            if key not in depth:
                depth[key] = {"type": "bid", "quantity": 0, "price_usd": order.price_cents / 100}
            depth[key]["quantity"] += order.quantity

        for order in _asks:
            key = str(order.price_cents)
            if key not in depth:
                depth[key] = {"type": "ask", "quantity": 0, "price_usd": order.price_cents / 100}
            depth[key]["quantity"] += order.quantity

        return depth


def place_order(order: OrderRequest, user_id: str) -> tuple[int, int]:
    """
    Match order against the book; add remainder (if any) to the book.

    Returns (filled_qty, remaining_qty).
    Raises ValueError if the order would breach MAX_ORDERS_IN_MEMORY.
    """
    price_cents = int(order.price * 100)

    with _lock:
        remaining = _fill_order(order.side, price_cents, order.qty, user_id)
        filled = order.qty - remaining

        if remaining > 0:
            target = _bids if order.side == "bid" else _asks
            if len(target) >= MAX_ORDERS_IN_MEMORY:
                raise ValueError(
                    f"Orderbook full: max {MAX_ORDERS_IN_MEMORY} orders per side"
                )
            target.append(_BookOrder(user_id=user_id, price_cents=price_cents, quantity=remaining))
            if order.side == "bid":
                _bids.sort(key=lambda o: o.price_cents, reverse=True)
            else:
                _asks.sort(key=lambda o: o.price_cents)

        return filled, remaining


# ---------------------------------------------------------------------------
# Internal matching engine  (called inside _lock)
# ---------------------------------------------------------------------------

def _fill_order(side: str, price_cents: int, quantity: int, user_id: str) -> int:
    """
    Returns remaining unfilled quantity.
    Mutates _asks/_bids and _users in place.
    Must be called while holding _lock.
    """
    remaining = quantity

    if side == "bid":
        # Walk asks from cheapest upward (index 0 = lowest ask)
        i = 0
        while i < len(_asks) and remaining > 0:
            ask = _asks[i]
            if ask.price_cents > price_cents:
                break  # asks are sorted low→high; no cheaper asks remain
            if ask.quantity > remaining:
                ask.quantity -= remaining
                _flip_balance(ask.user_id, user_id, remaining, ask.price_cents)
                remaining = 0
            else:
                remaining -= ask.quantity
                _flip_balance(ask.user_id, user_id, ask.quantity, ask.price_cents)
                _asks.pop(i)
                # don't increment i — next order shifts into position i
    else:
        # Walk bids from cheapest upward (index -1 = lowest bid when sorted high→low)
        i = len(_bids) - 1
        while i >= 0 and remaining > 0:
            bid = _bids[i]
            if bid.price_cents < price_cents:
                i -= 1
                continue
            if bid.quantity > remaining:
                bid.quantity -= remaining
                _flip_balance(user_id, bid.user_id, remaining, bid.price_cents)
                remaining = 0
            else:
                remaining -= bid.quantity
                _flip_balance(user_id, bid.user_id, bid.quantity, bid.price_cents)
                _bids.pop(i)
                i -= 1

    return remaining


def _flip_balance(seller_id: str, buyer_id: str, quantity: int, price_cents: int) -> None:
    """
    Transfer shares from seller→buyer and USD from buyer→seller.
    Silent no-op if either account is unknown (should not happen in practice).
    """
    seller = _users.get(seller_id)
    buyer = _users.get(buyer_id)
    if not seller or not buyer:
        return

    cost_cents = quantity * price_cents
    seller.usd_cents += cost_cents
    buyer.usd_cents -= cost_cents
    seller.shares -= quantity
    buyer.shares += quantity