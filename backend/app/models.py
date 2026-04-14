

from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Balance(db.Model):
    """
    One row per user.  balance_cents is stored as integer cents.
    Seed: user_id='user1', balance_cents=5_000_000 (= $50,000.00).
    """

    __tablename__ = "balances"

    user_id: str = db.Column(db.String(64), primary_key=True)
    balance_cents: int = db.Column(db.Integer, nullable=False)

    def to_dict(self) -> dict:
        return {
            "user_id": self.user_id,
            "balance_usd": self.balance_cents / 100,
        }


class TradeAudit(db.Model):
    """
    Append-only audit log.  Never mutated after insert.
    status is either 'APPROVED' or 'REJECTED'.
    """

    __tablename__ = "trade_audit"

    id: int = db.Column(db.Integer, primary_key=True, autoincrement=True)
    timestamp: datetime = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    user_id: str = db.Column(db.String(64), nullable=False)
    ticker: str = db.Column(db.String(16), nullable=False)
    side: str = db.Column(db.String(4), nullable=False)   # 'bid' | 'ask'
    qty: int = db.Column(db.Integer, nullable=False)
    price_cents: int = db.Column(db.Integer, nullable=False)
    status: str = db.Column(db.String(8), nullable=False)  # APPROVED | REJECTED
    reason: str = db.Column(db.String(256), nullable=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat(),
            "user_id": self.user_id,
            "ticker": self.ticker,
            "side": self.side,
            "qty": self.qty,
            "price_usd": self.price_cents / 100,
            "trade_value_usd": (self.qty * self.price_cents) / 100,
            "status": self.status,
            "reason": self.reason or "",
        }