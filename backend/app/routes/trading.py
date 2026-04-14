from flask import Blueprint, jsonify, request
from pydantic import ValidationError

from app.models import db, Balance, TradeAudit
from app.services.orderbook import get_depth, get_user_balances, place_order
from app.services.risks import run_risk_checks
from app.schema import OrderRequest

# Create a blueprint for the routes
api_bp = Blueprint('api', __name__)

@api_bp.route("/")
def home():
    return jsonify({"message": "TradeGuard API is running. Use /api/health to check status."})

@api_bp.get("/api/health")
def health():
    return jsonify({"status": "ok"})

@api_bp.post("/api/orders")
def place_order_route():
    raw = request.get_json(silent=True) or {}

    try:
        order = OrderRequest(**raw)
    except ValidationError as exc:
        return jsonify({"status": "REJECTED", "reason": str(exc), "filled_qty": 0, "remaining_qty": raw.get("qty", 0)}), 400

    balance_row = Balance.query.get(order.user_id)
    if balance_row is None:
        return jsonify({"status": "REJECTED", "reason": "Unknown user", "filled_qty": 0, "remaining_qty": order.qty}), 404
    
    balance_cents = balance_row.balance_cents
    risk_result = run_risk_checks(order, balance_cents)
    price_cents = int(order.price * 100)

    if not risk_result.passed:
        _write_audit(order, price_cents, "REJECTED", risk_result.reason)
        return jsonify({
            "status": "REJECTED",
            "reason": risk_result.reason,
            "filled_qty": 0,
            "remaining_qty": order.qty,
            "balance_usd": balance_cents / 100,
        }), 200

    try:
        filled_qty, remaining_qty = place_order(order, order.user_id)
    except ValueError as exc:
        _write_audit(order, price_cents, "REJECTED", str(exc))
        return jsonify({
            "status": "REJECTED",
            "reason": str(exc),
            "filled_qty": 0,
            "remaining_qty": order.qty,
            "balance_usd": balance_cents / 100,
        }), 200

    ob_balances = get_user_balances(order.user_id)
    if ob_balances:
        balance_row.balance_cents = int(ob_balances["usd"] * 100)
        db.session.commit()

    _write_audit(order, price_cents, "APPROVED", "")

    return jsonify({
        "status": "APPROVED",
        "filled_qty": filled_qty,
        "remaining_qty": remaining_qty,
        "reason": "",
        "balance_usd": balance_row.balance_cents / 100,
    }), 200

@api_bp.get("/api/depth")
def depth_route():
    return jsonify({"depth": get_depth()})

@api_bp.get("/api/balance/<user_id>")
def balance_route(user_id: str):
    row = Balance.query.get(user_id)
    ob = get_user_balances(user_id)
    if row is None:
        return jsonify({"error": "user not found"}), 404
    return jsonify({
        "user_id": user_id,
        "balance_usd": row.balance_cents / 100,
        "shares": ob["shares"] if ob else 0,
    })

@api_bp.get("/api/audit")
def audit_route():
    limit = min(int(request.args.get("limit", 10)), 50)
    rows = (
        TradeAudit.query
        .order_by(TradeAudit.id.desc())
        .limit(limit)
        .all()
    )
    return jsonify({"entries": [r.to_dict() for r in rows]})

def _write_audit(order: OrderRequest, price_cents: int, status: str, reason: str) -> None:
    db.session.add(TradeAudit(
        user_id=order.user_id,
        ticker=order.ticker,
        side=order.side,
        qty=order.qty,
        price_cents=price_cents,
        status=status,
        reason=reason or None,
    ))
    db.session.commit()