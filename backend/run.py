import os
import sys
from flask import Flask
from flask_cors import CORS

# Ensure backend package root is on path
sys.path.insert(0, os.path.dirname(__file__))

from app.models import db, Balance
from app.services.orderbook import seed_user
from app.routes.trading import api_bp  # Import the blueprint

def create_app(db_path: str = "tradeguard.db") -> Flask:
    app = Flask(__name__)
    CORS(app, origins="*")

    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    # Register the routes blueprint
    app.register_blueprint(api_bp)

    with app.app_context():
        db.create_all()
        _seed_initial_state()

    return app

def _seed_initial_state() -> None:
    """Idempotent startup seeding."""
    SEED_USD = 50_000_00  # $50,000.00 in cents
    SEED_SHARES = 10

    if not Balance.query.get("user1"):
        db.session.add(Balance(user_id="user1", balance_cents=SEED_USD))
        db.session.commit()

    seed_user("user1", usd_cents=SEED_USD, shares=SEED_SHARES)
    seed_user("market_maker", usd_cents=999_999_99, shares=1000)

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)