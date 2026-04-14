const API = "http://127.0.0.1:5000";

export default function OrderBook({ depth }) {
  const bids = Object.values(depth)
    .filter((d) => d.type === "bid")
    .sort((a, b) => b.price_usd - a.price_usd)
    .slice(0, 8);

  const asks = Object.values(depth)
    .filter((d) => d.type === "ask")
    .sort((a, b) => a.price_usd - b.price_usd)
    .slice(0, 8);

  const bestBid = bids[0]?.price_usd ?? 0;
  const bestAsk = asks[0]?.price_usd ?? 0;
  const spread = bestAsk && bestBid ? (bestAsk - bestBid).toFixed(2) : "—";
  const maxQty = Math.max(...[...bids, ...asks].map((o) => o.quantity), 1);

  const Row = ({ order, type }) => {
    const pct = Math.round((order.quantity / maxQty) * 100);
    return (
      <div className="relative flex items-center justify-between px-3 py-1.5 rounded-md overflow-hidden group">
        <div
          className={`absolute inset-y-0 left-0 rounded-md opacity-10 transition-all ${
            type === "bid" ? "bg-emerald-500" : "bg-red-500"
          }`}
          style={{ width: `${pct}%` }}
        />
        <span className={`font-mono text-xs font-semibold relative z-10 ${type === "bid" ? "text-emerald-400" : "text-red-400"}`}>
          ${order.price_usd.toFixed(2)}
        </span>
        <span className="font-mono text-xs text-[#888] relative z-10">{order.quantity}</span>
      </div>
    );
  };

  return (
    <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.15em] text-[#555] uppercase">Live Orderbook</p>
          <h2 className="text-white font-semibold text-lg mt-0.5">Market Depth</h2>
        </div>
        <div className="flex items-center gap-4 text-xs text-[#555]">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest mb-0.5">Best Bid</p>
            <p className="font-mono text-emerald-400 font-semibold">${bestBid.toFixed(2)}</p>
          </div>
          <div className="w-px h-8 bg-[#1e1e1e]" />
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest mb-0.5">Best Ask</p>
            <p className="font-mono text-red-400 font-semibold">${bestAsk.toFixed(2)}</p>
          </div>
          <div className="w-px h-8 bg-[#1e1e1e]" />
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest mb-0.5">Spread</p>
            <p className="font-mono text-white font-semibold">${spread}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Bids */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between px-3 pb-1 border-b border-[#1e1e1e]">
            <span className="text-[10px] uppercase tracking-widest text-[#555]">Bids</span>
            <span className="text-[10px] uppercase tracking-widest text-[#555]">Volume</span>
          </div>
          {bids.length === 0 ? (
            <p className="text-[#444] text-xs px-3 py-4 text-center">No buy orders</p>
          ) : (
            bids.map((b, i) => <Row key={i} order={b} type="bid" />)
          )}
        </div>

        {/* Asks */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between px-3 pb-1 border-b border-[#1e1e1e]">
            <span className="text-[10px] uppercase tracking-widest text-[#555]">Asks</span>
            <span className="text-[10px] uppercase tracking-widest text-[#555]">Volume</span>
          </div>
          {asks.length === 0 ? (
            <p className="text-[#444] text-xs px-3 py-4 text-center">No sell orders</p>
          ) : (
            asks.map((a, i) => <Row key={i} order={a} type="ask" />)
          )}
        </div>
      </div>
    </div>
  );
}