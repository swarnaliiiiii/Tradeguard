export default function PortfolioCard({ balance }) {
  return (
    <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-6 flex flex-col gap-5">
      <div>
        <p className="text-[10px] font-semibold tracking-[0.15em] text-[#555] uppercase">Portfolio</p>
        <h2 className="text-3xl font-bold text-white mt-1 font-mono">
          ${balance?.balance_usd?.toLocaleString("en-US", { minimumFractionDigits: 2 }) ?? "—"}
        </h2>
        <p className="text-[#555] text-xs mt-1">Available cash</p>
      </div>

      <div className="h-px bg-[#1e1e1e]" />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#555] mb-1">Shares held</p>
          <p className="text-white font-mono font-semibold text-xl">{balance?.shares ?? "—"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#555] mb-1">Risk limit</p>
          <p className="text-white font-mono font-semibold text-xl">$10,000</p>
        </div>
      </div>

      {/* Gate status */}
      <div className="bg-[#141414] border border-[#1e1e1e] rounded-lg p-4 flex flex-col gap-3">
        <p className="text-[10px] uppercase tracking-widest text-[#555]">Service checks</p>
        {[
          { label: "Gate", status: "active" },
          { label: "Book", status: "active" },
          { label: "Audit", status: "active" },
        ].map(({ label, status }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-[#888] text-xs">{label}</span>
            <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              On
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}