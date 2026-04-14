import sys
import os
import pytest
from decimal import Decimal

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import create_app
from app.models import db, Balance, TradeAudit
from app.services.orderbook import seed_user, get_user_balances, get_depth, place_order
import app.services.orderbook as ob_module
from app.services.risks import run_risk_checks
from app.schema import OrderRequest


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def app():
    """Fresh in-memory DB + clean orderbook for each test."""
    application = create_app(db_path=":memory:")
    # Reset orderbook module state
    ob_module._bids.clear()
    ob_module._asks.clear()
    ob_module._users.clear()

    with application.app_context():
        db.create_all()
        db.session.add(Balance(user_id="user1", balance_cents=5_000_000))
        db.session.commit()
        seed_user("user1", usd_cents=5_000_000, shares=10)
        seed_user("market_maker", usd_cents=999_999_99, shares=1000)
        yield application


@pytest.fixture()
def client(app):
    return app.test_client()


# ---------------------------------------------------------------------------
# Risk gate tests
# ---------------------------------------------------------------------------

class TestRiskGate:
    def _order(self, **kwargs):
        defaults = dict(user_id="user1", ticker="GOOGL", side="bid", qty=1, price=Decimal("100.00"))
        defaults.update(kwargs)
        return OrderRequest(**defaults)

    def test_max_trade_size_rejected(self):
        order = self._order(qty=200, price=Decimal("100.00"))  # $20,000
        result = run_risk_checks(order, 5_000_000)
        assert not result.passed
        assert "10,000" in result.reason

    def test_max_trade_size_at_limit_passes(self):
        order = self._order(qty=100, price=Decimal("100.00"))  # exactly $10,000
        result = run_risk_checks(order, 5_000_000)
        assert result.passed

    def test_solvency_rejected(self):
        order = self._order(qty=100, price=Decimal("100.00"))  # $10,000
        result = run_risk_checks(order, 999_99)  # only $999.99
        assert not result.passed
        assert "Insufficient" in result.reason

    def test_solvency_ask_not_checked(self):
        """Ask orders skip the solvency check (USD side)."""
        order = self._order(side="ask", qty=1, price=Decimal("100.00"))
        result = run_risk_checks(order, 0)
        assert result.passed


# ---------------------------------------------------------------------------
# Audit log invariants
# ---------------------------------------------------------------------------

class TestAuditLog:
    def test_audit_row_created_on_approval(self, client, app):
        with app.app_context():
            before = TradeAudit.query.count()
        r = client.post("/api/orders", json={
            "user_id": "user1", "ticker": "GOOGL",
            "side": "bid", "qty": 1, "price": "100.00"
        })
        assert r.status_code == 200
        with app.app_context():
            assert TradeAudit.query.count() == before + 1

    def test_audit_row_created_on_rejection(self, client, app):
        with app.app_context():
            before = TradeAudit.query.count()
        r = client.post("/api/orders", json={
            "user_id": "user1", "ticker": "GOOGL",
            "side": "bid", "qty": 500, "price": "100.00"  # $50,000 > max
        })
        assert r.status_code == 200
        data = r.get_json()
        assert data["status"] == "REJECTED"
        with app.app_context():
            assert TradeAudit.query.count() == before + 1

    def test_rejected_order_does_not_change_balance(self, client, app):
        with app.app_context():
            original = Balance.query.get("user1").balance_cents
        client.post("/api/orders", json={
            "user_id": "user1", "ticker": "GOOGL",
            "side": "bid", "qty": 500, "price": "100.00"
        })
        with app.app_context():
            assert Balance.query.get("user1").balance_cents == original


# ---------------------------------------------------------------------------
# Orderbook / matching tests
# ---------------------------------------------------------------------------

class TestOrderbook:
    def test_bid_reduces_balance(self, client, app):
        # Add an ask from market_maker first
        ask_order = OrderRequest(user_id="market_maker", ticker="GOOGL",
                                  side="ask", qty=5, price=Decimal("100.00"))
        ob_module._lock.acquire()
        ob_module._asks.append(ob_module._BookOrder("market_maker", 10000, 5))
        ob_module._asks.sort(key=lambda o: o.price_cents)
        ob_module._lock.release()

        with app.app_context():
            before = Balance.query.get("user1").balance_cents

        client.post("/api/orders", json={
            "user_id": "user1", "ticker": "GOOGL",
            "side": "bid", "qty": 5, "price": "100.00"
        })
        with app.app_context():
            after = Balance.query.get("user1").balance_cents
        assert after == before - 5 * 10000  # 5 shares × $100 = $500

    def test_depth_no_negative_quantities(self, app):
        depth = get_depth()
        for v in depth.values():
            assert v["quantity"] >= 0

    def test_orderbook_full_raises(self, app):
        ob_module._bids.clear()
        for i in range(100):
            ob_module._bids.append(ob_module._BookOrder("user1", 10000 + i, 1))
        order = OrderRequest(user_id="user1", ticker="GOOGL",
                              side="bid", qty=1, price=Decimal("50.00"))
        with pytest.raises(ValueError, match="full"):
            place_order(order, "user1")