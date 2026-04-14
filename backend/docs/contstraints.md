constraints.md — System Limits & Invariants

These are hard limits enforced at the system level.
Violating any of these is a defect, not a configuration choice.

---

Order Limits

| Limit                        | Value       | Enforced in        |
|------------------------------|-------------|--------------------|
| Max single trade value       | $10,000.00  | `risk.py`          |
| Max orders in memory per side| 100         | `orderbook.py`     |
| Min order quantity           | 1 share     | `schemas.py`       |
| Min order price              | $0.01       | `schemas.py`       |
| Price decimal places         | 2           | `schemas.py`       |

#Account Limits

| Limit                        | Value       | Enforced in        |
|------------------------------|-------------|--------------------|
| Seed balance (new user)      | $50,000.00  | `app.py` seed      |
| Seed shares (new user)       | 10          | `app.py` seed      |
| Minimum balance after trade  | $0.00       | `risk.py` solvency |

API Limits

| Limit                        | Value       | Enforced in        |
|------------------------------|-------------|--------------------|
| Max audit rows returned      | 50          | `app.py`           |
| CORS origins (dev)           | *           | `app.py`           |

Business Rules

- No fractional shares — `qty` is always a whole integer.
- No negative prices — price must be strictly positive.
- No self-fills — a user's bid cannot match their own ask.
  *(Not yet enforced — tracked as known limitation.)*
- Weekend trading — not blocked in this MVP; add `_check_weekend`
  to `risk.py::RULES` to enforce.
- Single ticker — this MVP supports one ticker (`GOOGL`).
  Multi-ticker support requires partitioning the orderbook by ticker.

Known Limitations (not defects)

1. In-memory orderbook resets on server restart — not durable.
2. Single-user (`user1`) authentication — no auth layer.
3. Balance in SQLite is authoritative; orderbook mirror may lag by one
   request if the server crashes mid-update.
4. No websocket push — clients must poll `/api/depth` and `/api/audit`.
5. No weekend trading check (see business rules above).

Invariants the test suite must verify

- `TradeAudit` row count increases by exactly 1 per POST `/api/orders`.
- A rejected order never changes the `Balance` row.
- An approved bid order reduces `Balance.balance_cents` by `qty × price_cents`.
- `get_depth()` never returns a negative quantity.
- `place_order` raises `ValueError` when the book is full.