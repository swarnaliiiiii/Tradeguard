export default function AuditLog({ entries }) {
  return (
    <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-6 flex flex-col gap-4">
      <div>
        <p className="text-[10px] font-semibold tracking-[0.15em] text-[#555] uppercase">Audit</p>
        <h2 className="text-white font-semibold text-lg mt-0.5">Recent attempts</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#1e1e1e]">
              {["Time", "Ticker", "Side", "Qty", "Price", "Status", "Reason"].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10px] uppercase tracking-widest text-[#555] pb-3 pr-4 font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141414]">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-[#444] py-8">
                  No audit entries yet
                </td>
              </tr>
            ) : (
              entries.map((e, i) => (
                <tr key={i} className="group hover:bg-[#141414] transition-colors">
                  <td className="py-3 pr-4 text-[#666] font-mono">
                    {new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="py-3 pr-4 text-white font-mono font-semibold">{e.ticker}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        e.side === "bid"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {e.side === "bid" ? "Buy" : "Sell"}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-[#aaa] font-mono">{e.qty}</td>
                  <td className="py-3 pr-4 text-[#aaa] font-mono">${(e.price_cents / 100).toFixed(2)}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        e.status === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${e.status === "APPROVED" ? "bg-emerald-400" : "bg-red-400"}`} />
                      {e.status}
                    </span>
                  </td>
                  <td className="py-3 text-[#555] max-w-[200px] truncate" title={e.reason || "Passed all checks"}>
                    {e.reason || "Passed all checks"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}