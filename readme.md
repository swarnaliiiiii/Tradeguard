# TradeGuard: Pre-Trade Risk & Order Book Engine

**TradeGuard** is a high-integrity middleware service designed to sit between a trading terminal and an exchange. It ensures that every order is validated against strict financial risk rules before being committed to a live Limit Order Book.

## Technical Stack
* **Backend:** Python 3.11, Flask (API Framework)
* **Frontend:** React (Vite), Tailwind CSS
* **Database:** SQLite + SQLAlchemy (Relational Audit Log)
* **Safety:** Pydantic (Type Enforcement & Schema Validation)
* **Environment:** Docker (Containerized for consistency)

---

## Architecture & Structure
The project follows a **Modular Monolith** structure with clear separation of concerns to ensure **Change Resilience**.

* `/api`: Flask routes and request handling.
* `/services`: 
    * `risk_manager.py`: The "Gate Keeper" logic (pure business rules).
    * `orderbook.py`: In-memory state management for active orders.
* `/models`: SQLAlchemy schemas for persistent audit trails.
* `/validators`: Pydantic models for interface safety.

---

## Key Technical Decisions

### 1. Interface Safety over "Clever" Code
To prevent invalid states, I implemented a **Zero-Trust Boundary**. Every request entering the system is validated by Pydantic. If a price is negative or a ticker is missing, the system rejects it at the gate before it ever touches the database or order book.

### 2. Relational Persistence vs. In-Memory State
* **Audit Log (SQLite):** I chose a relational database for trade history because financial records require ACID compliance and persistence.
* **Order Book (In-Memory):** The active book is kept in memory (sorted lists) to simulate the low-latency requirements of a trading environment.

### 3. Observability as a First-Class Citizen
Failures are not just caught; they are categorized. Every rejected trade is logged in the `TradeAudit` table with a specific `reason_code` (e.g., `ERR_INSUFFICIENT_FUNDS`, `ERR_MAX_LIMIT_EXCEEDED`). This ensures the system is diagnosable without looking at stack traces.

---

## AI Usage & Guidance
This project was developed using a **"Human-in-the-Loop"** AI strategy.

* **Guidance Files:** I utilized `agents.md` and `constraints.md` to constrain the AI. For example, the AI was strictly forbidden from using floating-point numbers for currency, forcing the use of `Decimal` for precision.
* **Verification:** AI was used to generate the boilerplate for the React frontend and SQLAlchemy models, while the core sorting logic of the Order Book and the Risk Engine logic were manually reviewed and unit-tested to ensure correctness.

---

##  Risks & Extensions
* **Concurrency:** In the current MVP, the in-memory order book is not thread-safe. For a production environment, I would implement **Redis-based locking** or a **Message Queue (RabbitMQ)** to handle high-frequency concurrent orders.
* **Scalability:** To scale, the Risk Engine could be moved to a Lambda/Serverless function to handle bursts of validation requests independently of the Order Book state.

---

##  Getting Started

### Prerequisites
* Python 3.10+
* Node.js & npm

### Installation
1.  **Backend:**
    ```bash
    cd backend
    pip install -r requirements.txt
    python app.py
    ```
2.  **Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---

## Verification
Run the automated test suite to verify the Risk Engine rules:
```bash
pytest backend/tests/test.py
```
*Tests cover: Insufficient balance, Max order size violations, and successful book placement.*

## Future Scope & Scalability
The architecture of TradeGuard is built on the principle of Modular Decoupling. To transition this from an MVP to a production-ready HFT system, the following roadmap is proposed:

Distributed Caching: Move the OrderBook state to Redis to support horizontal scaling across multiple API instances.

Asynchronous Processing: Use Celery + RabbitMQ to handle the TradeAudit logging. This ensures that a slow database write never delays the execution of a high-speed trade.

Circuit Breaker Integration: Implement a circuit breaker on the Risk Engine. If the database or external price feed goes down, the system will automatically "fail-safe" and reject all incoming orders to protect user capital.