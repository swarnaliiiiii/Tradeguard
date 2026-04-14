import { useState } from "react";

const API = "http://127.0.0.1:5000";

export default function OrderForm({ onOrderResult, onRefresh }) {
  const [side, setSide] = useState("bid");
  const [ticker, setTicker] = useState("GOOGL");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");
  const [loading, setLoading] = useState(false);

  const notional = price && qty ? (parseFloat(price) * parseInt(qty)).toFixed(2) : "—";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!price || !qty) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "user1",
          ticker,
          side,
          price: parseFloat(price),
          qty: parseInt(qty),
        }),
      });
      const data = await res.json();
      onOrderResult(data);
      onRefresh();
    } catch {
      onOrderResult({ status: "ERROR", reason: "Network error — is the backend running?" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.15em] text-[#555] uppercase">Order Entry</p>
          <h2 className="text-white font-semibold text-lg mt-0.5">Route a guarded order</h2>
        </div>
        <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-lg p-1">
          {["bid", "ask"].map((s) => (
            <button
              key={s}
              onClick={() => setSide(s)}
              className={`px-5 py-1.5 rounded-md text-sm font-semibold transition-all duration-150 ${
                side === s
                  ? s === "bid"
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                    : "bg-red-500 text-white shadow-lg shadow-red-500/20"
                  : "text-[#555] hover:text-white"
              }`}
            >
              {s === "bid" ? "Buy" : "Sell"}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs grid */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-[#555] uppercase tracking-widest font-medium">Ticker</label>
            <input
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="bg-[#161616] border border-[#262626] rounded-lg px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-[#404040] transition-colors"
              placeholder="GOOGL"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-[#555] uppercase tracking-widest font-medium">Price (USD)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="bg-[#161616] border border-[#262626] rounded-lg px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-[#404040] transition-colors"
              placeholder="100.00"
              step="0.01"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-[#555] uppercase tracking-widest font-medium">Quantity</label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="bg-[#161616] border border-[#262626] rounded-lg px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-[#404040] transition-colors"
              placeholder="10"
            />
          </div>
        </div>

        {/* Notional + limit info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#161616] border border-[#1e1e1e] rounded-lg px-4 py-3">
            <p className="text-[10px] text-[#555] uppercase tracking-widest mb-1">Order Notional</p>
            <p className="text-white font-mono text-base font-semibold">
              {notional !== "—" ? `$${parseFloat(notional).toLocaleString()}` : "—"}
            </p>
          </div>
          <div className="bg-[#161616] border border-[#1e1e1e] rounded-lg px-4 py-3">
            <p className="text-[10px] text-[#555] uppercase tracking-widest mb-1">Hard Limit</p>
            <p className="text-white font-mono text-base font-semibold">$10,000.00</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !price || !qty}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-150 ${
            side === "bid"
              ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/25 disabled:opacity-40"
              : "bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/25 disabled:opacity-40"
          } disabled:cursor-not-allowed`}
        >
          {loading ? "Routing…" : `Place ${side === "bid" ? "Buy" : "Sell"} Order`}
        </button>
      </form>
    </div>
  );
}